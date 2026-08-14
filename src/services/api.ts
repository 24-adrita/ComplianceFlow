import {
  Company,
  User,
  ComplianceRecord,
  AuditLog,
  NotificationItem,
  DashboardMetrics,
  DashboardOverviewData,
  DashboardChartsData
} from '../types';
import apiClient from '../lib/api-client';

const API_BASE = '/api';

export const ApiService = {
  // Auth
  login: async (email: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  getMe: async (userId: string) => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'x-user-id': userId }
    });
    return res.json();
  },

  // Dashboard Metrics & Analytics
  getDashboardMetrics: async (companyId?: string): Promise<{ success: boolean; metrics: DashboardMetrics }> => {
    const query = companyId && companyId !== 'all' ? `?companyId=${companyId}` : '';
    const res = await fetch(`${API_BASE}/dashboard/metrics${query}`);
    return res.json();
  },

  getDashboardOverview: async (companyId?: string, departmentId?: string): Promise<{ success: boolean; data: DashboardOverviewData; message?: string }> => {
    const params = new URLSearchParams();
    if (companyId && companyId !== 'all') params.append('companyId', companyId);
    if (departmentId && departmentId !== 'all') params.append('departmentId', departmentId);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    return apiClient.get(`/dashboard/overview${queryString}`);
  },

  getDashboardCharts: async (companyId?: string, departmentId?: string): Promise<{ success: boolean; data: DashboardChartsData; message?: string }> => {
    const params = new URLSearchParams();
    if (companyId && companyId !== 'all') params.append('companyId', companyId);
    if (departmentId && departmentId !== 'all') params.append('departmentId', departmentId);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    return apiClient.get(`/dashboard/charts${queryString}`);
  },
  // Companies
  getCompanies: async (): Promise<{ success: boolean; companies: Company[] }> => {
    const res = await fetch(`${API_BASE}/companies`);
    return res.json();
  },

  createCompany: async (companyData: Partial<Company>): Promise<{ success: boolean; company: Company }> => {
    const res = await fetch(`${API_BASE}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(companyData)
    });
    return res.json();
  },

  updateCompany: async (id: string, updates: Partial<Company>): Promise<{ success: boolean; company: Company }> => {
    const res = await fetch(`${API_BASE}/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Users
  getUsers: async (): Promise<{ success: boolean; users: User[] }> => {
    const res = await fetch(`${API_BASE}/users`);
    return res.json();
  },

  createUser: async (userData: Partial<User>): Promise<{ success: boolean; user: User }> => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<{ success: boolean; user: User }> => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Compliance Records
  getComplianceRecords: async (companyId?: string): Promise<{ success: boolean; records: ComplianceRecord[] }> => {
    const query = companyId && companyId !== 'all' ? `?companyId=${companyId}` : '';
    const res = await fetch(`${API_BASE}/compliance-records${query}`);
    return res.json();
  },

  createComplianceRecord: async (recordData: Partial<ComplianceRecord>, user: User): Promise<{ success: boolean; record: ComplianceRecord }> => {
    const res = await fetch(`${API_BASE}/compliance-records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
        'x-user-name': user.name,
        'x-user-role': user.role
      },
      body: JSON.stringify(recordData)
    });
    return res.json();
  },

  updateComplianceRecord: async (id: string, updates: Partial<ComplianceRecord>, user: User): Promise<{ success: boolean; record: ComplianceRecord }> => {
    const res = await fetch(`${API_BASE}/compliance-records/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
        'x-user-name': user.name,
        'x-user-role': user.role
      },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  deleteComplianceRecord: async (id: string, user: User): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/compliance-records/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': user.id,
        'x-user-name': user.name,
        'x-user-role': user.role
      }
    });
    return res.json();
  },

  advanceRenewalWorkflow: async (id: string, step: ComplianceRecord['renewalStep'], notes: string, user: User): Promise<{ success: boolean; record: ComplianceRecord }> => {
    const res = await fetch(`${API_BASE}/compliance-records/${id}/advance-renewal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id,
        'x-user-name': user.name,
        'x-user-role': user.role
      },
      body: JSON.stringify({ step, notes })
    });
    return res.json();
  },

  verifyQRToken: async (token: string) => {
    const res = await fetch(`${API_BASE}/qr/verify/${encodeURIComponent(token)}`);
    return res.json();
  },

  verifyQRCode: async (qrCodeId: string): Promise<{ success: boolean; record?: ComplianceRecord; message?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/v1/verify/${encodeURIComponent(qrCodeId)}`);
      if (res.ok) return res.json();
      const res2 = await fetch(`${API_BASE}/qr/verify/${encodeURIComponent(qrCodeId)}`);
      return res2.json();
    } catch (err) {
      return { success: false, message: 'Failed to reach verification endpoint' };
    }
  },

  getRenewalPipeline: async (): Promise<{ success: boolean; renewals: any[] }> => {
    try {
      const res = await fetch(`${API_BASE}/renewals`);
      if (res.ok) return res.json();
      return { success: true, renewals: [] };
    } catch (err) {
      return { success: true, renewals: [] };
    }
  },
  // Global Search
  globalSearch: async (params: { query: string; category?: string; companyId?: string }) => {
    const qParams = new URLSearchParams();
    if (params.query) qParams.append('query', params.query);
    if (params.category && params.category !== 'all') qParams.append('category', params.category);
    if (params.companyId && params.companyId !== 'all') qParams.append('companyId', params.companyId);
    
    const res = await fetch(`${API_BASE}/search?${qParams.toString()}`);
    return res.json();
  },

  // Notifications
  getNotifications: async (userId: string): Promise<{ success: boolean; notifications: NotificationItem[] }> => {
    const res = await fetch(`${API_BASE}/notifications?userId=${userId}`);
    return res.json();
  },

  markNotificationRead: async (id: string) => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
    return res.json();
  },

  sendEmailReminder: async (recordId: string, recipientEmail?: string) => {
    const res = await fetch(`${API_BASE}/reminders/trigger-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordId, recipientEmail })
    });
    return res.json();
  },

  // Audit Logs
  getAuditLogs: async (companyId?: string): Promise<{ success: boolean; auditLogs: AuditLog[] }> => {
    const query = companyId && companyId !== 'all' ? `?companyId=${companyId}` : '';
    const res = await fetch(`${API_BASE}/audit-logs${query}`);
    return res.json();
  },

  getAuditLogsFiltered: async (params: {
    companyId?: string;
    userId?: string;
    action?: string;
    entityType?: string;
    severity?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const qParams = new URLSearchParams();
    if (params.companyId && params.companyId !== 'all') qParams.append('companyId', params.companyId);
    if (params.userId && params.userId !== 'all') qParams.append('userId', params.userId);
    if (params.action && params.action !== 'all') qParams.append('action', params.action);
    if (params.entityType && params.entityType !== 'all') qParams.append('entityType', params.entityType);
    if (params.severity && params.severity !== 'all') qParams.append('severity', params.severity);
    if (params.search) qParams.append('search', params.search);
    if (params.startDate) qParams.append('startDate', params.startDate);
    if (params.endDate) qParams.append('endDate', params.endDate);
    if (params.page) qParams.append('page', params.page.toString());
    if (params.limit) qParams.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/audit-logs?${qParams.toString()}`);
    return res.json();
  },

  getAuditMetrics: async (companyId?: string) => {
    const query = companyId && companyId !== 'all' ? `?companyId=${companyId}` : '';
    const res = await fetch(`${API_BASE}/audit-logs/metrics${query}`);
    return res.json();
  }
};

export default ApiService;
