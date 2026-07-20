const API_URL = import.meta.env.VITE_API_URL as string

if (!API_URL) {
  throw new Error('Missing VITE_API_URL. Set it in .env (e.g. http://localhost:4000/api).')
}

const TOKEN_KEY = 'mos_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export interface ApiUser {
  id: string
  full_name: string
  email: string
  role: 'applicant' | 'admin' | 'agent'
  phone?: string
  country?: string
  nationality?: string
  passport_number?: string
  date_of_birth?: string
  status?: string
  created_at?: string
}

async function request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> ?? {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_URL}${path}`, { ...init, headers })
  if (!res.ok) {
    let msg = `Request failed (${res.status})`
    try {
      const j = await res.json()
      msg = j.error ?? (typeof j.message === 'string' ? j.message : msg)
    } catch { /* ignore */ }
    if (res.status === 401) setToken(null)
    throw new Error(msg)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  // Auth
  signup: (input: { full_name: string; email: string; password: string; phone?: string; country?: string; nationality?: string; date_of_birth?: string }) =>
    request<{ token: string; user: ApiUser }>('/auth/signup', { method: 'POST', body: JSON.stringify(input) }),
  login: (email: string, password: string) =>
    request<{ token: string; user: ApiUser }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  bootstrapAdmin: (secret: string, email: string, fullName?: string) =>
    request<{ ok: boolean; user: ApiUser }>('/auth/bootstrap-admin', { method: 'POST', body: JSON.stringify({ secret, email, fullName }) }),

  // Public
  listRequirements: () => request<any[]>('/public/visa-requirements'),
  listRequirementsForCountry: (country: string) => request<any[]>(`/public/visa-requirements/${encodeURIComponent(country)}`),
  listCountries: () => request<{ country: string }[]>('/public/countries'),

  // Applicant
  getMe: () => request<ApiUser>('/applicant/me'),
  updateMe: (patch: Partial<ApiUser>) => request<ApiUser>('/applicant/me', { method: 'PATCH', body: JSON.stringify(patch) }),
  listMyApplications: () => request<any[]>('/applicant/me/applications'),
  createApplication: (input: { visa_country: string; visa_type: string; priority?: string; notes?: string }) =>
    request<any>('/applicant/me/applications', { method: 'POST', body: JSON.stringify(input) }),
  listMyDocuments: () => request<any[]>('/applicant/me/documents'),
  addDocument: (input: { document_name: string; file_url: string }) =>
    request<any>('/applicant/me/documents', { method: 'POST', body: JSON.stringify(input) }),
  listMyPayments: () => request<any[]>('/applicant/me/payments'),
  listMyMessages: () => request<any[]>('/applicant/me/messages'),
  sendMessage: (input: { subject?: string; message: string }) =>
    request<any>('/applicant/me/messages', { method: 'POST', body: JSON.stringify(input) }),
  listMyNotifications: () => request<any[]>('/applicant/me/notifications'),
  markAllNotificationsRead: () => request<any>('/applicant/me/notifications/read-all', { method: 'POST' }),
  markNotificationRead: (id: string) => request<any>(`/applicant/me/notifications/${id}/read`, { method: 'POST' }),

  // Admin
  adminStats: () => request<any>('/admin/stats'),
  adminListApplicants: (q?: string) => request<any[]>(`/admin/applicants${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  adminGetApplicant: (id: string) => request<any>(`/admin/applicants/${id}`),
  adminUpdateApplicant: (id: string, patch: any) => request<any>(`/admin/applicants/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  adminListApplications: (q?: string) => request<any[]>(`/admin/applications${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  adminUpdateApplicationStatus: (id: string, body: { status: string; note?: string; assigned_agent?: string; priority?: string }) =>
    request<any>(`/admin/applications/${id}/status`, { method: 'POST', body: JSON.stringify(body) }),
  adminListDocuments: () => request<any[]>('/admin/documents'),
  adminVerifyDocument: (id: string, status: string) => request<any>(`/admin/documents/${id}/verify`, { method: 'POST', body: JSON.stringify({ status }) }),
  adminListPayments: () => request<any[]>('/admin/payments'),
  adminListMessages: (applicantId: string) => request<any[]>(`/admin/messages/${applicantId}`),
  adminReply: (applicantId: string, body: { subject?: string; message: string }) =>
    request<any>(`/admin/messages/${applicantId}/reply`, { method: 'POST', body: JSON.stringify(body) }),
  adminListRequirements: () => request<any[]>('/admin/requirements'),
  adminUpsertRequirement: (row: any) => request<any>('/admin/requirements', { method: 'POST', body: JSON.stringify(row) }),
  adminUpdateRequirement: (row: any) => request<any>('/admin/requirements', { method: 'PATCH', body: JSON.stringify(row) }),
  adminDeleteRequirement: (country: string, visa_type: string) =>
    request<any>(`/admin/requirements?country=${encodeURIComponent(country)}&visa_type=${encodeURIComponent(visa_type)}`, { method: 'DELETE' }),
  adminListTemplates: () => request<any[]>('/admin/templates'),
  adminUpdateTemplate: (name: string, subject: string, html_body: string) =>
    request<any>('/admin/templates', { method: 'PATCH', body: JSON.stringify({ name, subject, html_body }) }),
  adminExportUrl: () => `${API_URL}/admin/export`,
}
