import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types/express.types.js';
import DashboardService from './dashboard.service.js';

export class DashboardController {
  /**
   * GET /api/v1/dashboard/overview
   * Get comprehensive dashboard metrics, analytics, risk forecast & activity logs
   */
  static async getOverview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const companyId = req.query.companyId as string | undefined;
      const departmentId = req.query.departmentId as string | undefined;

      const dashboardData = await DashboardService.getOverview(
        req.user!,
        companyId,
        departmentId
      );

      res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'Dashboard overview retrieved successfully.',
        data: dashboardData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default DashboardController;
