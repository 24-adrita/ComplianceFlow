import { NavRoute } from '../components/layout/Sidebar';

export type CanonicalRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export type PermissionAction =
  | 'manage_users'
  | 'change_user_role'
  | 'delete_user'
  | 'create_company'
  | 'edit_company'
  | 'delete_company'
  | 'manage_companies'
  | 'create_department'
  | 'edit_department'
  | 'delete_department'
  | 'manage_departments'
  | 'create_record'
  | 'edit_record'
  | 'delete_record'
  | 'advance_renewal'
  | 'upload_attachment'
  | 'export_reports';

/**
 * Normalizes any string or legacy role value to one of the 3 standardized roles:
 * - ADMIN
 * - MANAGER
 * - EMPLOYEE
 */
export function normalizeRole(role?: string | null): CanonicalRole {
  if (!role) return 'EMPLOYEE';
  const r = role.toLowerCase().trim();
  if (
    r === 'admin' ||
    r === 'super_admin' ||
    r === 'company_admin' ||
    r === 'global admin' ||
    r === 'global_admin'
  ) {
    return 'ADMIN';
  }
  if (
    r === 'manager' ||
    r === 'compliance_officer' ||
    r === 'compliance officer' ||
    r === 'officer'
  ) {
    return 'MANAGER';
  }
  return 'EMPLOYEE';
}

/**
 * Returns whether a given role can access a frontend navigation route.
 */
export function canAccessNavRoute(role: string | undefined | null, route: NavRoute): boolean {
  const canonical = normalizeRole(role);

  switch (route) {
    case 'dashboard':
    case 'records':
    case 'renewals':
    case 'calendar':
    case 'notifications':
    case 'search':
    case 'profile':
    case 'change_password':
    case 'qr_verify':
      return true;

    case 'departments':
      return canonical === 'ADMIN' || canonical === 'MANAGER';

    case 'companies':
      return canonical === 'ADMIN';

    case 'users':
      return canonical === 'ADMIN';

    default:
      return true;
  }
}

/**
 * Returns whether a given role can perform a specific operational action.
 */
export function canPerformAction(role: string | undefined | null, action: PermissionAction): boolean {
  const canonical = normalizeRole(role);

  switch (action) {
    case 'manage_users':
    case 'change_user_role':
    case 'delete_user':
    case 'create_company':
    case 'edit_company':
    case 'delete_company':
    case 'manage_companies':
    case 'delete_department':
    case 'delete_record':
      return canonical === 'ADMIN';

    case 'create_department':
    case 'edit_department':
    case 'manage_departments':
    case 'create_record':
    case 'edit_record':
    case 'export_reports':
      return canonical === 'ADMIN' || canonical === 'MANAGER';

    case 'advance_renewal':
    case 'upload_attachment':
      return canonical === 'ADMIN' || canonical === 'MANAGER' || canonical === 'EMPLOYEE';

    default:
      return false;
  }
}
