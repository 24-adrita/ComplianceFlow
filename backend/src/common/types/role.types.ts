/**
 * ComplianceFlow - User Role & Access Definitions
 */

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  DEPARTMENT_MANAGER = 'DEPARTMENT_MANAGER',
  AUDITOR = 'AUDITOR',
  EMPLOYEE = 'EMPLOYEE',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

export const ALL_ROLES: UserRole[] = Object.values(UserRole);

/**
 * Role Permission Hierarchies and Capability Maps
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    'system:all',
    'company:create',
    'company:read',
    'company:update',
    'company:delete',
    'user:all',
    'compliance:all',
    'audit:all',
    'report:all',
  ],
  [UserRole.COMPANY_ADMIN]: [
    'company:read',
    'company:update',
    'department:all',
    'user:manage_tenant',
    'compliance:all',
    'renewal:all',
    'audit:read',
    'notification:all',
  ],
  [UserRole.COMPLIANCE_OFFICER]: [
    'compliance:create',
    'compliance:read',
    'compliance:update',
    'compliance:delete',
    'renewal:create',
    'renewal:read',
    'renewal:update',
    'notification:read',
    'audit:read',
  ],
  [UserRole.DEPARTMENT_MANAGER]: [
    'compliance:read',
    'compliance:create_department',
    'renewal:read',
    'department:read',
    'notification:read',
  ],
  [UserRole.AUDITOR]: [
    'compliance:read_audit',
    'audit:read',
    'company:read_summary',
    'report:read',
  ],
  [UserRole.EMPLOYEE]: [
    'compliance:read_assigned',
    'notification:read_self',
  ],
};
