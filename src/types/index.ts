export type UserRole = 
  | 'super_admin' 
  | 'compliance_officer' 
  | 'company_admin' 
  | 'auditor' 
  | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  companyId: string;
  companyName: string;
  departmentId?: string | DepartmentItem | null;
  department: string;
  avatar?: string;
  avatarUrl?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  mfaEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Company {
  id: string;
  name: string;
  registrationNumber: string;
  taxId: string;
  industry: string;
  country: string;
  status: 'active' | 'pending' | 'suspended';
  complianceScore: number;
  contactEmail: string;
  contactPhone: string;
  address: string;
  createdDate: string;
  totalRecordsCount?: number;
  code?: string;
}

export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  companyId: string;
  companyName: string;
  managerId?: string | null;
  managerName?: string | null;
  managerEmail?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  memberCount: number;
  complianceRecordCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ComplianceCategory = 
  | 'Corporate & Legal'
  | 'Tax & Financial'
  | 'Environmental & Safety'
  | 'Data Privacy & ISO'
  | 'HR & Labor'
  | 'Trade & Export'
  | 'Healthcare & FDA'
  | 'Operational License';

export type ComplianceStatus = 
  | 'compliant' 
  | 'warning' 
  | 'expired' 
  | 'renewal_in_progress' 
  | 'pending_review';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ComplianceRecord {
  id: string;
  title: string;
  code: string;
  companyId: string;
  companyName: string;
  department?: string;
  category: ComplianceCategory;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  renewalFrequencyDays: number;
  status: ComplianceStatus;
  riskLevel: RiskLevel;
  priority?: RiskLevel;
  estimatedCost: number;
  assignedUserId: string;
  assignedUserName: string;
  documentUrl?: string;
  documentName?: string;
  notes?: string;
  autoRenewal?: boolean;
  tags: string[];
  qrToken: string;
  lastRenewedDate?: string;
  renewalStep?: 'not_started' | 'docs_prep' | 'submitted' | 'under_review' | 'approved' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  companyId: string;
  action: string;
  entityType: 'ComplianceRecord' | 'Company' | 'User' | 'Auth' | 'Renewal' | 'System' | 'Notification';
  entityId: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failure' | 'warning';
}

export interface NotificationItem {
  id: string;
  userId: string;
  recipientName?: string;
  recipientEmail?: string;
  companyId?: string;
  companyName?: string;
  sender?: string;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  readAt?: string | null;
  createdAt: string;
  linkRecordId?: string;
  deliveryStatus?: 'delivered' | 'pending' | 'failed';
  metadata?: Record<string, any>;
  isDeleted?: boolean;
}

export interface DashboardMetrics {
  totalRecords: number;
  compliantCount: number;
  warningCount: number;
  expiredCount: number;
  inProgressCount: number;
  overallComplianceScore: number;
  expiringIn30Days: number;
  expiringIn60Days: number;
  expiringIn90Days: number;
  totalEstimatedRenewalCost: number;
  categoryBreakdown: Array<{ name: string; value: number; compliant: number }>;
  riskBreakdown: Array<{ name: string; value: number }>;
  recentAuditLogs: AuditLog[];
  upcomingExpirations: ComplianceRecord[];
}

export type RenewalStatus =
  | 'CREATED'
  | 'PENDING_RENEWAL'
  | 'PROCESSING'
  | 'APPROVED'
  | 'REJECTED'
  | 'RENEWED'
  | 'CANCELLED';

export interface RenewalStatusHistoryItem {
  previousStatus: RenewalStatus | string;
  newStatus: RenewalStatus;
  changedBy: string;
  changedAt: string;
  notes?: string;
}

export interface RenewalRecord {
  id: string;
  renewalNumber: string;
  complianceRecordId: string;
  complianceDocumentName: string;
  companyId: string;
  companyName: string;
  department: string;
  requestedById: string;
  requestedByName: string;
  assignedReviewerId: string;
  assignedReviewerName: string;
  renewalCost: number;
  currency: string;
  status: RenewalStatus;
  newIssueDate: string;
  newExpiryDate: string;
  licenseNumber: string;
  notes?: string;
  documentUrl?: string;
  documentName?: string;
  statusHistory: RenewalStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

