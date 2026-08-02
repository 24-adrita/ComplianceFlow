import mongoose from 'mongoose';
import ComplianceRecordModel, { IComplianceRecord } from './compliance.model.js';
import CompanyModel from '../company/company.model.js';
import DepartmentModel from '../company/department.model.js';
import UserModel from '../user/user.model.js';
import AuditLogModel from '../audit/audit.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../config/cloudinary.js';
import {
  AuditAction,
  AuditEntity,
  ComplianceCategory,
  ComplianceStatus,
  PriorityLevel,
  RenewalFrequency,
} from '../../common/constants/enums.js';
import { UserRole } from '../../common/types/role.types.js';
import { AuthUser } from '../../common/types/express.types.js';
import {
  CreateComplianceRecordInput,
  UpdateComplianceRecordInput,
} from './compliance.validation.js';

export class ComplianceService {
  /**
   * Helper: Calculate automatic expiry status if not explicitly overridden
   */
  private static calculateAutoStatus(expiryDate: Date, explicitStatus?: ComplianceStatus): ComplianceStatus {
    if (
      explicitStatus &&
      [ComplianceStatus.PENDING_RENEWAL, ComplianceStatus.PROCESSING, ComplianceStatus.RENEWED].includes(
        explicitStatus
      )
    ) {
      return explicitStatus;
    }

    const now = new Date();
    const diffTime = new Date(expiryDate).getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return ComplianceStatus.EXPIRED;
    } else if (daysRemaining <= 30) {
      return ComplianceStatus.EXPIRING_SOON;
    } else {
      return ComplianceStatus.ACTIVE;
    }
  }

  /**
   * Helper: Validate multi-tenant company scope
   */
  private static validateTenantScope(currentUser: AuthUser, companyId: string | mongoose.Types.ObjectId): void {
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return;
    }

    if (
      currentUser.role === UserRole.COMPANY_ADMIN ||
      currentUser.role === UserRole.COMPLIANCE_OFFICER ||
      currentUser.role === UserRole.DEPARTMENT_MANAGER ||
      currentUser.role === UserRole.EMPLOYEE ||
      currentUser.role === UserRole.AUDITOR
    ) {
      if (!currentUser.companyId || companyId.toString() !== currentUser.companyId.toString()) {
        const error = new Error('Access Denied: You cannot view or modify compliance records outside your company tenant.') as Error & { statusCode?: number };
        error.statusCode = 403;
        throw error;
      }
      return;
    }

    const error = new Error('Forbidden: Insufficient permissions.') as Error & { statusCode?: number };
    error.statusCode = 403;
    throw error;
  }

  /**
   * Helper: Validate department belongs to company & responsible person belongs to department
   */
  private static async validateDepartmentAndPerson(
    companyId: string | mongoose.Types.ObjectId,
    departmentId: string,
    responsiblePersonId?: string
  ): Promise<void> {
    // 1. Verify Department
    const department = await DepartmentModel.findOne({
      _id: departmentId,
      isDeleted: false,
    });

    if (!department) {
      const error = new Error('Specified department not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    if (department.companyId.toString() !== companyId.toString()) {
      const error = new Error(
        `Department '${department.name}' does not belong to the selected company.`
      ) as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    // 2. Verify Responsible Person if provided
    if (responsiblePersonId) {
      const user = await UserModel.findById(responsiblePersonId);
      if (!user) {
        const error = new Error('Designated responsible person user account not found.') as Error & { statusCode?: number };
        error.statusCode = 404;
        throw error;
      }

      // Check if user belongs to the same department or company
      if (user.companyId && user.companyId.toString() !== companyId.toString()) {
        const error = new Error('Responsible person does not belong to the selected company tenant.') as Error & { statusCode?: number };
        error.statusCode = 400;
        throw error;
      }

      if (user.departmentId && user.departmentId.toString() !== departmentId.toString()) {
        const error = new Error('Responsible person must belong to the selected department.') as Error & { statusCode?: number };
        error.statusCode = 400;
        throw error;
      }
    }
  }

  /**
   * Create a new Compliance Record
   */
  static async createComplianceRecord(
    input: CreateComplianceRecordInput,
    currentUser: AuthUser,
    fileBuffer?: Buffer,
    fileName?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IComplianceRecord> {
    // Determine Target Company ID
    let targetCompanyId = input.companyId;
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      targetCompanyId = currentUser.companyId?.toString();
    }

    if (!targetCompanyId) {
      const error = new Error('Company tenant ID is required to create a compliance record.') as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    const companyObjectId = new mongoose.Types.ObjectId(targetCompanyId);

    // 1. Verify Company Exists
    const company = await CompanyModel.findOne({ _id: companyObjectId, isDeleted: false });
    if (!company) {
      const error = new Error('Associated company tenant not found or deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    // 2. Validate License Number Uniqueness within the company
    const trimmedLicenseNumber = input.licenseNumber.trim();
    const existingLicense = await ComplianceRecordModel.findOne({
      companyId: companyObjectId,
      licenseNumber: { $regex: new RegExp(`^${trimmedLicenseNumber.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') },
      isDeleted: false,
    });

    if (existingLicense) {
      const error = new Error(
        `License/Certificate number '${trimmedLicenseNumber}' already exists within this company.`
      ) as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    // 3. Validate Department & Responsible Person Relationships
    await this.validateDepartmentAndPerson(
      targetCompanyId,
      input.departmentId,
      input.responsiblePersonId
    );

    // 4. Calculate Status based on Expiry Date
    const issueDate = new Date(input.issueDate);
    const expiryDate = new Date(input.expiryDate);

    if (expiryDate <= issueDate) {
      const error = new Error('Expiry date must be after the issue date.') as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    const computedStatus = this.calculateAutoStatus(expiryDate, input.status);

    // 5. Handle Attachment Upload if File Provided
    let attachmentUrl = '';
    let attachmentPublicId = '';

    if (fileBuffer && fileName) {
      const uploadResult = await uploadToCloudinary(fileBuffer, fileName, `company_${targetCompanyId}/compliance`);
      attachmentUrl = uploadResult.url;
      attachmentPublicId = uploadResult.publicId;
    }

    // Generate unique QR Code ID
    const qrCodeId = `QR_COMP_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 6. Create Compliance Record
    const record = await ComplianceRecordModel.create({
      documentName: input.documentName.trim(),
      licenseNumber: trimmedLicenseNumber,
      category: input.category,
      companyId: companyObjectId,
      departmentId: new mongoose.Types.ObjectId(input.departmentId),
      responsiblePersonId: input.responsiblePersonId
        ? new mongoose.Types.ObjectId(input.responsiblePersonId)
        : undefined,
      issuingAuthority: input.issuingAuthority.trim(),
      issueDate,
      expiryDate,
      renewalFrequency: input.renewalFrequency || RenewalFrequency.ANNUAL,
      priority: input.priority || PriorityLevel.MEDIUM,
      status: computedStatus,
      notes: input.notes || '',
      supportingAttachmentUrl: attachmentUrl,
      supportingAttachmentPublicId: attachmentPublicId,
      qrCodeId,
      autoRenewalEnabled: input.autoRenewalEnabled || false,
      isDeleted: false,
      createdBy: currentUser.id as unknown as IComplianceRecord['createdBy'],
      updatedBy: currentUser.id as unknown as IComplianceRecord['updatedBy'],
    });

    // 7. Write Audit Log
    await AuditLogModel.create({
      companyId: companyObjectId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.CREATE,
      entity: AuditEntity.COMPLIANCE_RECORD,
      entityId: record._id.toString(),
      details: {
        documentName: record.documentName,
        licenseNumber: record.licenseNumber,
        category: record.category,
        status: record.status,
      },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return record;
  }

  /**
   * Get Single Compliance Record Details
   */
  static async getComplianceRecordById(
    recordId: string,
    currentUser: AuthUser
  ): Promise<IComplianceRecord> {
    const record = await ComplianceRecordModel.findOne({
      _id: recordId,
      isDeleted: false,
    })
      .populate('companyId', 'name code industry logoUrl status')
      .populate('departmentId', 'name code status')
      .populate('responsiblePersonId', 'name email role avatarUrl phoneNumber')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!record) {
      const error = new Error('Compliance record not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    // Validate multi-tenant tenant scope
    this.validateTenantScope(currentUser, record.companyId);

    return record;
  }

  /**
   * List / Search / Filter / Paginate / Sort Compliance Records
   */
  static async listComplianceRecords(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      companyId?: string;
      departmentId?: string;
      responsiblePersonId?: string;
      category?: ComplianceCategory;
      priority?: PriorityLevel;
      status?: ComplianceStatus;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    },
    currentUser: AuthUser
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { isDeleted: false };

    // Multi-tenant scoping
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      if (currentUser.companyId) {
        filter.companyId = new mongoose.Types.ObjectId(currentUser.companyId);
      }
    } else if (query.companyId) {
      filter.companyId = new mongoose.Types.ObjectId(query.companyId);
    }

    if (query.departmentId) {
      filter.departmentId = new mongoose.Types.ObjectId(query.departmentId);
    }

    if (query.responsiblePersonId) {
      filter.responsiblePersonId = new mongoose.Types.ObjectId(query.responsiblePersonId);
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      const searchRegex = { $regex: query.search, $options: 'i' };
      filter.$or = [
        { documentName: searchRegex },
        { licenseNumber: searchRegex },
        { issuingAuthority: searchRegex },
        { notes: searchRegex },
      ];
    }

    // Sort configuration
    const sortField = query.sortBy || 'expiryDate';
    const sortDirection = query.sortOrder === 'desc' ? -1 : 1;
    const sortOptions: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const [records, totalRecords] = await Promise.all([
      ComplianceRecordModel.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('companyId', 'name code industry')
        .populate('departmentId', 'name code')
        .populate('responsiblePersonId', 'name email avatarUrl'),
      ComplianceRecordModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      records,
      meta: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Update Compliance Record
   */
  static async updateComplianceRecord(
    recordId: string,
    input: UpdateComplianceRecordInput,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IComplianceRecord> {
    const record = await ComplianceRecordModel.findOne({ _id: recordId, isDeleted: false });

    if (!record) {
      const error = new Error('Compliance record not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    this.validateTenantScope(currentUser, record.companyId);

    // 1. Validate License Number uniqueness if changed
    if (input.licenseNumber && input.licenseNumber.trim().toLowerCase() !== record.licenseNumber.toLowerCase()) {
      const trimmedLicense = input.licenseNumber.trim();
      const existingLicense = await ComplianceRecordModel.findOne({
        _id: { $ne: record._id },
        companyId: record.companyId,
        licenseNumber: { $regex: new RegExp(`^${trimmedLicense.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') },
        isDeleted: false,
      });

      if (existingLicense) {
        const error = new Error(
          `Another compliance record with license number '${trimmedLicense}' already exists.`
        ) as Error & { statusCode?: number };
        error.statusCode = 400;
        throw error;
      }
      record.licenseNumber = trimmedLicense;
    }

    // 2. Validate Department and Responsible Person if changed
    const targetDeptId = input.departmentId || record.departmentId.toString();
    const targetRespPersonId =
      input.responsiblePersonId !== undefined
        ? input.responsiblePersonId || undefined
        : record.responsiblePersonId?.toString();

    if (input.departmentId || input.responsiblePersonId !== undefined) {
      await this.validateDepartmentAndPerson(
        record.companyId,
        targetDeptId,
        targetRespPersonId
      );
    }

    if (input.departmentId) record.departmentId = new mongoose.Types.ObjectId(input.departmentId);
    if (input.responsiblePersonId !== undefined) {
      record.responsiblePersonId = input.responsiblePersonId
        ? new mongoose.Types.ObjectId(input.responsiblePersonId)
        : undefined;
    }

    if (input.documentName) record.documentName = input.documentName.trim();
    if (input.category) record.category = input.category;
    if (input.issuingAuthority) record.issuingAuthority = input.issuingAuthority.trim();
    if (input.issueDate) record.issueDate = new Date(input.issueDate);
    if (input.expiryDate) record.expiryDate = new Date(input.expiryDate);
    if (input.renewalFrequency) record.renewalFrequency = input.renewalFrequency;
    if (input.priority) record.priority = input.priority;
    if (input.notes !== undefined) record.notes = input.notes;
    if (input.autoRenewalEnabled !== undefined) record.autoRenewalEnabled = input.autoRenewalEnabled;

    // Recalculate status if dates or status changed
    if (input.expiryDate || input.status) {
      record.status = this.calculateAutoStatus(record.expiryDate, input.status || record.status);
    }

    record.updatedBy = currentUser.id as unknown as IComplianceRecord['updatedBy'];
    await record.save();

    // Audit Log Entry
    await AuditLogModel.create({
      companyId: record.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.UPDATE,
      entity: AuditEntity.COMPLIANCE_RECORD,
      entityId: record._id.toString(),
      details: { updatedFields: Object.keys(input) },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return record;
  }

  /**
   * Upload / Replace Attachment for Compliance Record
   */
  static async uploadAttachment(
    recordId: string,
    fileBuffer: Buffer,
    fileName: string,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IComplianceRecord> {
    const record = await ComplianceRecordModel.findOne({ _id: recordId, isDeleted: false });

    if (!record) {
      const error = new Error('Compliance record not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    this.validateTenantScope(currentUser, record.companyId);

    // If existing attachment exists, delete from Cloudinary
    if (record.supportingAttachmentPublicId) {
      await deleteFromCloudinary(record.supportingAttachmentPublicId);
    }

    // Upload new attachment to Cloudinary
    const uploadResult = await uploadToCloudinary(
      fileBuffer,
      fileName,
      `company_${record.companyId}/compliance`
    );

    record.supportingAttachmentUrl = uploadResult.url;
    record.supportingAttachmentPublicId = uploadResult.publicId;
    record.updatedBy = currentUser.id as unknown as IComplianceRecord['updatedBy'];

    await record.save();

    // Write Audit Log
    await AuditLogModel.create({
      companyId: record.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.UPDATE,
      entity: AuditEntity.COMPLIANCE_RECORD,
      entityId: record._id.toString(),
      details: { action: 'ATTACHMENT_UPLOADED_OR_REPLACED', fileName, attachmentUrl: record.supportingAttachmentUrl },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return record;
  }

  /**
   * Remove Attachment from Compliance Record
   */
  static async removeAttachment(
    recordId: string,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<IComplianceRecord> {
    const record = await ComplianceRecordModel.findOne({ _id: recordId, isDeleted: false });

    if (!record) {
      const error = new Error('Compliance record not found or has been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    this.validateTenantScope(currentUser, record.companyId);

    if (record.supportingAttachmentPublicId) {
      await deleteFromCloudinary(record.supportingAttachmentPublicId);
    }

    record.supportingAttachmentUrl = '';
    record.supportingAttachmentPublicId = '';
    record.updatedBy = currentUser.id as unknown as IComplianceRecord['updatedBy'];

    await record.save();

    // Write Audit Log
    await AuditLogModel.create({
      companyId: record.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.UPDATE,
      entity: AuditEntity.COMPLIANCE_RECORD,
      entityId: record._id.toString(),
      details: { action: 'ATTACHMENT_REMOVED' },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return record;
  }

  /**
   * Soft Delete Compliance Record
   */
  static async deleteComplianceRecord(
    recordId: string,
    currentUser: AuthUser,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ message: string }> {
    const record = await ComplianceRecordModel.findOne({ _id: recordId, isDeleted: false });

    if (!record) {
      const error = new Error('Compliance record not found or has already been deleted.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    this.validateTenantScope(currentUser, record.companyId);

    record.isDeleted = true;
    record.deletedAt = new Date();
    record.deletedBy = currentUser.id as unknown as IComplianceRecord['deletedBy'];

    await record.save();

    // Write Audit Log
    await AuditLogModel.create({
      companyId: record.companyId,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: AuditAction.DELETE,
      entity: AuditEntity.COMPLIANCE_RECORD,
      entityId: record._id.toString(),
      details: {
        documentName: record.documentName,
        licenseNumber: record.licenseNumber,
      },
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
    });

    return { message: `Compliance record '${record.documentName}' soft deleted successfully.` };
  }

  /**
   * View Record Audit History
   */
  static async getRecordHistory(
    recordId: string,
    currentUser: AuthUser
  ) {
    const record = await ComplianceRecordModel.findOne({ _id: recordId, isDeleted: false });

    if (!record) {
      const error = new Error('Compliance record not found.') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    this.validateTenantScope(currentUser, record.companyId);

    const auditLogs = await AuditLogModel.find({
      entity: AuditEntity.COMPLIANCE_RECORD,
      entityId: recordId,
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email role');

    return {
      recordId,
      documentName: record.documentName,
      licenseNumber: record.licenseNumber,
      history: auditLogs,
    };
  }
}

export default ComplianceService;
