import {
  User,
  Employee,
  IncomeCategory,
  Project,
  FundRequest,
  GroupDisbursement,
  IncomeRecord,
  Transaction,
  SystemLog,
  ApiSettings,
} from '../types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let errMsg = `Request failed: ${res.statusText}`;
    try {
      const errorJson = await res.json();
      if (errorJson.error) errMsg = errorJson.error;
    } catch {
      // fallback
    }
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // --- AUTH ---
  login: (email: string, password: string) =>
    request<User>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // --- USERS ---
  getUsers: () => request<User[]>('/api/users'),
  createUser: (data: Omit<User, 'id' | 'createdAt'>) =>
    request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (id: string, data: Partial<User>) =>
    request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteUser: (id: string) =>
    request<{ success: boolean }>(`/api/users/${id}`, {
      method: 'DELETE',
    }),

  // --- EMPLOYEES ---
  getEmployees: () => request<Employee[]>('/api/employees'),
  createEmployee: (data: Omit<Employee, 'id' | 'createdAt'>) =>
    request<Employee>('/api/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEmployee: (id: string, data: Partial<Employee>) =>
    request<Employee>(`/api/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteEmployee: (id: string) =>
    request<{ success: boolean }>(`/api/employees/${id}`, {
      method: 'DELETE',
    }),

  // --- CATEGORIES ---
  getCategories: () => request<IncomeCategory[]>('/api/categories'),
  createCategory: (data: Omit<IncomeCategory, 'id'>) =>
    request<IncomeCategory>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCategory: (id: string, data: Partial<IncomeCategory>) =>
    request<IncomeCategory>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    request<{ success: boolean }>(`/api/categories/${id}`, {
      method: 'DELETE',
    }),

  // --- PROJECTS ---
  getProjects: () => request<Project[]>('/api/projects'),
  createProject: (data: Omit<Project, 'id'>) =>
    request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProject: (id: string, data: Partial<Project>) =>
    request<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProject: (id: string) =>
    request<{ success: boolean }>(`/api/projects/${id}`, {
      method: 'DELETE',
    }),

  // --- FUND REQUESTS ---
  getFundRequests: (params?: { project?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.project) searchParams.set('project', params.project);
    if (params?.status) searchParams.set('status', params.status);
    const qs = searchParams.toString();
    return request<FundRequest[]>(`/api/fund-requests${qs ? `?${qs}` : ''}`);
  },
  getFundRequest: (id: string) => request<FundRequest>(`/api/fund-requests/${id}`),
  createFundRequest: (data: Partial<FundRequest>) =>
    request<FundRequest>('/api/fund-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateFundRequest: (id: string, data: Partial<FundRequest>) =>
    request<FundRequest>(`/api/fund-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteFundRequest: (id: string) =>
    request<{ success: boolean }>(`/api/fund-requests/${id}`, {
      method: 'DELETE',
    }),
  reviewPicRequest: (id: string, action: 'approve' | 'reject', notes?: string) =>
    request<FundRequest>(`/api/fund-requests/${id}/review-pic`, {
      method: 'POST',
      body: JSON.stringify({ action, notes }),
    }),
  adminApproveRequest: (id: string) =>
    request<FundRequest>(`/api/fund-requests/${id}/admin-approve`, {
      method: 'POST',
    }),
  adminRejectRequest: (id: string, notes: string) =>
    request<FundRequest>(`/api/fund-requests/${id}/admin-reject`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
  reviseFundRequest: (id: string, updatedFields: Partial<FundRequest>, revisionNotes: string, revisedBy?: string) =>
    request<FundRequest>(`/api/fund-requests/${id}/revise`, {
      method: 'POST',
      body: JSON.stringify({ updatedFields, revisionNotes, revisedBy }),
    }),
  uploadTransferProof: (id: string, proofName: string, proofUrl: string, tanggalTransfer: string, disbursedBy?: string) =>
    request<FundRequest>(`/api/fund-requests/${id}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ proofName, proofUrl, tanggalTransfer, disbursedBy }),
    }),

  // --- GROUP DISBURSEMENTS ---
  getGroupDisbursements: () => request<GroupDisbursement[]>('/api/group-disbursements'),
  createGroupDisbursement: (data: Omit<GroupDisbursement, 'id' | 'createdAt'>) =>
    request<GroupDisbursement>('/api/group-disbursements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateGroupDisbursement: (id: string, data: Partial<GroupDisbursement>) =>
    request<GroupDisbursement>(`/api/group-disbursements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteGroupDisbursement: (id: string) =>
    request<{ success: boolean }>(`/api/group-disbursements/${id}`, {
      method: 'DELETE',
    }),
  executeGroupDisbursement: (id: string, executedBy?: string) =>
    request<{ success: boolean; executionId: string }>(`/api/group-disbursements/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify({ executedBy }),
    }),

  // --- INCOME RECORDS ---
  getIncomeRecords: () => request<IncomeRecord[]>('/api/income-records'),
  createIncomeRecord: (data: Omit<IncomeRecord, 'id' | 'createdAt' | 'createdBy'> & { createdBy?: string }) =>
    request<IncomeRecord>('/api/income-records', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteIncomeRecord: (id: string) =>
    request<{ success: boolean }>(`/api/income-records/${id}`, {
      method: 'DELETE',
    }),

  // --- TRANSACTIONS ---
  getTransactions: () => request<Transaction[]>('/api/transactions'),

  // --- LOGS ---
  getLogs: () => request<SystemLog[]>('/api/logs'),
  addLog: (action: string, detail: string, user?: string, role?: string) =>
    request<{ success: boolean }>('/api/logs', {
      method: 'POST',
      body: JSON.stringify({ action, detail, user, role }),
    }),

  // --- SETTINGS ---
  getApiSettings: () => request<ApiSettings>('/api/settings/keys'),
  regenerateApiKeys: (generatedBy?: string) =>
    request<ApiSettings>('/api/settings/regenerate-keys', {
      method: 'POST',
      body: JSON.stringify({ generatedBy }),
    }),

  // --- SYSTEM RESET ---
  resetDatabase: () =>
    request<{ success: boolean; message: string }>('/api/system/reset', {
      method: 'POST',
    }),
};
