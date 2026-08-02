import mongoose from 'mongoose';
import ComplianceRecordModel from '../compliance/compliance.model.js';
import RenewalRecordModel from '../renewal/renewal.model.js';
import DepartmentModel from '../company/department.model.js';
import AuditLogModel from '../audit/audit.model.js';
import {
  ComplianceStatus,
  PriorityLevel,
  RenewalStatus,
} from '../../common/constants/enums.js';
import { UserRole } from '../../common/types/role.types.js';
import { AuthUser } from '../../common/types/express.types.js';

export class DashboardService {
  /**
   * Helper: Validate multi-tenant access control and resolve company scope
   */
  private static getCompanyFilter(currentUser: AuthUser, requestedCompanyId?: string): Record<string, unknown> {
    const filter: Record<string, unknown> = { isDeleted: false };

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      if (requestedCompanyId) {
        filter.companyId = new mongoose.Types.ObjectId(requestedCompanyId);
      }
    } else {
      if (!currentUser.companyId) {
        const error = new Error('Access Denied: User is not associated with any company tenant.') as Error & { statusCode?: number };
        error.statusCode = 403;
        throw error;
      }
      filter.companyId = new mongoose.Types.ObjectId(currentUser.companyId);
    }

    return filter;
  }

  /**
   * Get Complete Dashboard Overview
   */
  static async getOverview(currentUser: AuthUser, requestedCompanyId?: string, requestedDepartmentId?: string) {
    const baseFilter = this.getCompanyFilter(currentUser, requestedCompanyId);

    if (requestedDepartmentId) {
      baseFilter.departmentId = new mongoose.Types.ObjectId(requestedDepartmentId);
    }

    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // 1. Dashboard Cards Aggregation Pipeline
    const cardStatsPipeline = [
      { $match: baseFilter },
      {
        $group: {
          _id: null,
          totalDocuments: { $sum: 1 },
          activeDocuments: {
            $sum: {
              $cond: [
                { $in: ['$status', [ComplianceStatus.ACTIVE, ComplianceStatus.COMPLIANT, ComplianceStatus.RENEWED]] },
                1,
                0,
              ],
            },
          },
          expiringSoonDocuments: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$status', ComplianceStatus.EXPIRING_SOON] },
                    { $eq: ['$status', ComplianceStatus.NEARING_EXPIRY] },
                    {
                      $and: [
                        { $gt: ['$expiryDate', now] },
                        { $lte: ['$expiryDate', in30Days] },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          expiredDocuments: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$status', ComplianceStatus.EXPIRED] },
                    { $eq: ['$status', ComplianceStatus.NON_COMPLIANT] },
                    { $lte: ['$expiryDate', now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          pendingRenewalDocuments: {
            $sum: {
              $cond: [
                { $in: ['$status', [ComplianceStatus.PENDING_RENEWAL, ComplianceStatus.PROCESSING, ComplianceStatus.PENDING]] },
                1,
                0,
              ],
            },
          },
        },
      },
    ];

    const cardStatsResult = await ComplianceRecordModel.aggregate(cardStatsPipeline);
    const cardStats = cardStatsResult[0] || {
      totalDocuments: 0,
      activeDocuments: 0,
      expiringSoonDocuments: 0,
      expiredDocuments: 0,
      pendingRenewalDocuments: 0,
    };

    // 2. Count Total Renewed Requests from RenewalRecordModel
    const renewalFilter: Record<string, unknown> = { isDeleted: false };
    if (baseFilter.companyId) renewalFilter.companyId = baseFilter.companyId;
    if (baseFilter.departmentId) renewalFilter.departmentId = baseFilter.departmentId;

    const renewedCount = await RenewalRecordModel.countDocuments({
      ...renewalFilter,
      status: { $in: [RenewalStatus.RENEWED, RenewalStatus.APPROVED, RenewalStatus.COMPLETED] },
    });

    const cards = {
      totalDocuments: cardStats.totalDocuments,
      activeDocuments: cardStats.activeDocuments,
      expiringSoon: cardStats.expiringSoonDocuments,
      expiredDocuments: cardStats.expiredDocuments,
      renewedDocuments: renewedCount,
      pendingRenewals: cardStats.pendingRenewalDocuments,
    };

    // 3. Compliance Health Score Calculation
    const total = cardStats.totalDocuments || 1;
    const activeWeight = cardStats.activeDocuments * 1.0;
    const expiringWeight = cardStats.expiringSoonDocuments * 0.5;
    const rawScore = ((activeWeight + expiringWeight) / total) * 100;
    const healthScore = Math.min(100, Math.max(0, Math.round(rawScore * 10) / 10));

    let healthRating = 'Critical';
    if (healthScore >= 90) healthRating = 'Excellent';
    else if (healthScore >= 75) healthRating = 'Good';
    else if (healthScore >= 50) healthRating = 'Needs Attention';

    const healthSummary = {
      score: healthScore,
      rating: healthRating,
      compliantPercentage: Math.round((cardStats.activeDocuments / total) * 1000) / 10,
    };

    // 4. Risk Summary & Distribution
    const riskPipeline = [
      { $match: baseFilter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ];

    const riskRaw = await ComplianceRecordModel.aggregate(riskPipeline);
    const riskMap: Record<string, number> = {
      [PriorityLevel.HIGH]: 0,
      [PriorityLevel.MEDIUM]: 0,
      [PriorityLevel.LOW]: 0,
      [PriorityLevel.CRITICAL]: 0,
    };

    riskRaw.forEach((item) => {
      if (item._id) {
        riskMap[item._id] = item.count;
      }
    });

    // Calculate critical risk documents (High Priority + Expired or Expiring within 15 days)
    const criticalRiskCount = await ComplianceRecordModel.countDocuments({
      ...baseFilter,
      priority: { $in: [PriorityLevel.HIGH, PriorityLevel.CRITICAL] },
      $or: [
        { status: ComplianceStatus.EXPIRED },
        { expiryDate: { $lte: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000) } },
      ],
    });

    const riskSummary = {
      critical: criticalRiskCount || riskMap[PriorityLevel.CRITICAL] || 0,
      high: riskMap[PriorityLevel.HIGH] || 0,
      medium: riskMap[PriorityLevel.MEDIUM] || 0,
      low: riskMap[PriorityLevel.LOW] || 0,
    };

    // 5. Expiry Forecast (30, 60, 90 Days)
    const [next30DaysCount, next60DaysCount, next90DaysCount] = await Promise.all([
      ComplianceRecordModel.countDocuments({
        ...baseFilter,
        expiryDate: { $gt: now, $lte: in30Days },
      }),
      ComplianceRecordModel.countDocuments({
        ...baseFilter,
        expiryDate: { $gt: in30Days, $lte: in60Days },
      }),
      ComplianceRecordModel.countDocuments({
        ...baseFilter,
        expiryDate: { $gt: in60Days, $lte: in90Days },
      }),
    ]);

    const expiryForecast = {
      next30Days: next30DaysCount,
      next60Days: next60DaysCount,
      next90Days: next90DaysCount,
    };

    // 6. Upcoming Renewals (Top 5 Expiring Soonest)
    const upcomingRenewals = await ComplianceRecordModel.find({
      ...baseFilter,
      expiryDate: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    })
      .sort({ expiryDate: 1 })
      .limit(5)
      .populate('departmentId', 'name code')
      .populate('responsiblePersonId', 'name email avatarUrl')
      .populate('companyId', 'name code');

    // 7. High Risk Documents (Top 5 requiring urgent attention)
    const highRiskDocuments = await ComplianceRecordModel.find({
      ...baseFilter,
      $or: [
        { priority: { $in: [PriorityLevel.HIGH, PriorityLevel.CRITICAL] } },
        { status: ComplianceStatus.EXPIRED },
        { expiryDate: { $lte: in30Days } },
      ],
    })
      .sort({ expiryDate: 1, priority: -1 })
      .limit(5)
      .populate('departmentId', 'name code')
      .populate('responsiblePersonId', 'name email avatarUrl');

    // 8. Recent Activities (Audit Logs)
    const auditFilter: Record<string, unknown> = {};
    if (baseFilter.companyId) {
      auditFilter.companyId = baseFilter.companyId;
    }

    const recentActivities = await AuditLogModel.find(auditFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email avatarUrl role');

    // 9. Chart Data - Category Distribution
    const categoryPipeline = [
      { $match: baseFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 as const } },
    ];

    const categoryRaw = await ComplianceRecordModel.aggregate(categoryPipeline);
    const totalDocsForCat = cardStats.totalDocuments || 1;
    const categoryDistribution = categoryRaw.map((item) => ({
      category: item._id,
      count: item.count,
      percentage: Math.round((item.count / totalDocsForCat) * 1000) / 10,
    }));

    // 10. Chart Data - Department-wise Compliance
    const deptCompanyFilter = baseFilter.companyId ? { companyId: baseFilter.companyId, isDeleted: false } : { isDeleted: false };
    const departments = await DepartmentModel.find(deptCompanyFilter).select('name code');

    const departmentCompliancePipeline = [
      { $match: baseFilter },
      {
        $group: {
          _id: '$departmentId',
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [
                { $in: ['$status', [ComplianceStatus.ACTIVE, ComplianceStatus.COMPLIANT, ComplianceStatus.RENEWED]] },
                1,
                0,
              ],
            },
          },
          expiringSoon: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$status', ComplianceStatus.EXPIRING_SOON] },
                    { $eq: ['$status', ComplianceStatus.NEARING_EXPIRY] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          expired: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$status', ComplianceStatus.EXPIRED] },
                    { $eq: ['$status', ComplianceStatus.NON_COMPLIANT] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ];

    const deptStatsRaw = await ComplianceRecordModel.aggregate(departmentCompliancePipeline);
    const deptStatsMap = new Map<string, { total: number; active: number; expiringSoon: number; expired: number }>();
    deptStatsRaw.forEach((d) => {
      if (d._id) {
        deptStatsMap.set(d._id.toString(), {
          total: d.total,
          active: d.active,
          expiringSoon: d.expiringSoon,
          expired: d.expired,
        });
      }
    });

    const departmentCompliance = departments.map((dept) => {
      const stats = deptStatsMap.get(dept._id.toString()) || { total: 0, active: 0, expiringSoon: 0, expired: 0 };
      const rate = stats.total > 0 ? Math.round((stats.active / stats.total) * 1000) / 10 : 100;
      return {
        departmentId: dept._id,
        departmentName: dept.name,
        departmentCode: dept.code,
        totalDocuments: stats.total,
        activeDocuments: stats.active,
        expiringSoonDocuments: stats.expiringSoon,
        expiredDocuments: stats.expired,
        complianceRate: rate,
      };
    });

    // 11. Chart Data - Monthly Renewal Trend (Current Year)
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const monthlyTrendPipeline = [
      {
        $match: {
          ...renewalFilter,
          createdAt: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, status: '$status' },
          count: { $sum: 1 },
          totalCost: { $sum: '$renewalCost' },
        },
      },
    ];

    const monthlyTrendRaw = await RenewalRecordModel.aggregate(monthlyTrendPipeline);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const monthlyTrendMap = new Map<number, { renewed: number; pending: number; totalCost: number }>();
    for (let m = 1; m <= 12; m++) {
      monthlyTrendMap.set(m, { renewed: 0, pending: 0, totalCost: 0 });
    }

    monthlyTrendRaw.forEach((item) => {
      const m = item._id.month;
      const status = item._id.status;
      const entry = monthlyTrendMap.get(m);
      if (entry) {
        if ([RenewalStatus.RENEWED, RenewalStatus.APPROVED, RenewalStatus.COMPLETED].includes(status)) {
          entry.renewed += item.count;
        } else {
          entry.pending += item.count;
        }
        entry.totalCost += item.totalCost || 0;
      }
    });

    const monthlyRenewalTrend = Array.from(monthlyTrendMap.entries()).map(([monthNum, data]) => ({
      month: monthNames[monthNum - 1],
      monthNumber: monthNum,
      renewed: data.renewed,
      pending: data.pending,
      totalCost: Math.round(data.totalCost * 100) / 100,
    }));

    // 12. Chart Data - Risk Distribution
    const riskDistribution = [
      { priority: PriorityLevel.CRITICAL, count: riskSummary.critical },
      { priority: PriorityLevel.HIGH, count: riskSummary.high },
      { priority: PriorityLevel.MEDIUM, count: riskSummary.medium },
      { priority: PriorityLevel.LOW, count: riskSummary.low },
    ];

    return {
      cards,
      healthSummary,
      riskSummary,
      expiryForecast,
      upcomingRenewals,
      highRiskDocuments,
      recentActivities,
      charts: {
        monthlyRenewalTrend,
        departmentCompliance,
        categoryDistribution,
        riskDistribution,
      },
    };
  }
}

export default DashboardService;
