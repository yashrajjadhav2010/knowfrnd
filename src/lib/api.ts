// API Client for VYBE Platform

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('vybe_auth_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('vybe_auth_token', token);
  } else {
    localStorage.removeItem('vybe_auth_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
  }

  return data as T;
}

export const api = {
  // Auth
  getMe: () => request<{ authenticated: boolean; user: any }>('/auth/me'),
  switchDemoRole: (role: 'creator' | 'admin' | 'guest') =>
    request<{ token: string | null; user: any }>('/auth/switch-demo', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  // Experiences
  getExperiences: (params?: { type?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.type) q.append('type', params.type);
    if (params?.search) q.append('search', params.search);
    return request<{ experiences: any[] }>(`/experiences?${q.toString()}`);
  },
  getExperience: (slugOrId: string) => request<{ experience: any }>(`/experiences/${slugOrId}`),
  createExperience: (data: any) =>
    request<{ success: boolean; experience: any; shareUrl: string }>('/experiences', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteExperience: (id: string) =>
    request<{ success: boolean; message: string }>(`/experiences/${id}`, {
      method: 'DELETE',
    }),

  // Submissions
  submitQuiz: (id: string, data: { participant_name?: string; answers: Record<string, string>; submission_token?: string }) =>
    request<{ success: boolean; result: any }>(`/quiz/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  submitAnonymous: (id: string, data: { answers: any[]; responder_name?: string; consent_given?: boolean }) =>
    request<{ success: boolean; message: string; response_reference: string; privacy_mode: string }>(`/anonymous/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  votePoll: (id: string, data: { selected_option: 'A' | 'B'; voter_reference?: string }) =>
    request<{ success: boolean; already_voted: boolean; user_selection: string; tally: any }>(`/poll/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Creator Dashboard
  getDashboardOverview: () => request<{ metrics: any; recent_activity: any[]; user: any }>('/dashboard/overview'),
  getMyExperiences: (params?: { type?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.type) q.append('type', params.type);
    if (params?.status) q.append('status', params.status);
    return request<{ experiences: any[] }>(`/dashboard/experiences?${q.toString()}`);
  },
  getResponses: (experienceId: string) => request<any>(`/dashboard/responses/${experienceId}`),
  updateProfile: (data: { public_display_name?: string; username?: string; avatar_url?: string }) =>
    request<{ success: boolean; profile: any }>('/dashboard/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Public Reports
  submitReport: (data: { target_type: string; target_id: string; category: string; description: string; reporter_contact?: string }) =>
    request<{ success: boolean; message: string; report_id: string }>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Admin Protected
  getAdminOverview: () => request<{ metrics: any; recent_logs: any[] }>('/admin/overview'),
  getAdminUsers: (search?: string) => request<{ users: any[] }>(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  updateAdminUserStatus: (id: string, status: string) =>
    request<{ success: boolean; user: any }>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getAdminExperiences: (params?: { type?: string; status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.type) q.append('type', params.type);
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    return request<{ experiences: any[] }>(`/admin/experiences?${q.toString()}`);
  },
  moderateAdminExperience: (id: string, status: string) =>
    request<{ success: boolean; experience: any }>(`/admin/experiences/${id}/moderation`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getAdminSubmissions: () => request<{ submissions: any[] }>('/admin/submissions'),
  getAdminAnonymousResponses: () => request<{ responses: any[] }>('/admin/anonymous-responses'),
  getAdminReports: () => request<{ reports: any[] }>('/admin/reports'),
  updateAdminReport: (id: string, data: { status?: string; resolution_notes?: string }) =>
    request<{ success: boolean; report: any }>(`/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getAdminAuditLogs: () => request<{ audit_logs: any[] }>('/admin/audit-logs'),
  getAdminSettings: () => request<{ settings: any[] }>('/admin/settings'),
  updateAdminSettings: (settings: any[]) =>
    request<{ success: boolean; settings: any[] }>('/admin/settings', {
      method: 'POST',
      body: JSON.stringify({ settings }),
    }),
};
