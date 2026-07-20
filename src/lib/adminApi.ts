import { supabase } from './supabase'
import type { VisaStatus, Priority } from './types'

const FN = 'admin-api'

async function call<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const { data: session } = await supabase.auth.getSession()
  const token = session.session?.access_token
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FN}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    let msg = `Request failed (${res.status})`
    try { const j = await res.json(); msg = j.error ?? msg } catch { /* noop */ }
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}

export interface AdminStats {
  totalApplicants: number
  activeApplications: number
  completedVisas: number
  pendingDocuments: number
  revenue: number
  revenueCurrency: string
  byStatus: { status: string; count: number }[]
  byCountry: { country: string; count: number }[]
  last7Days: { date: string; count: number }[]
}

export const adminApi = {
  stats: () => call<AdminStats>('/stats'),
  listApplicants: (q?: string) => call<any[]>(`/applicants${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getApplicant: (id: string) => call<any>(`/applicants/${id}`),
  updateApplicant: (id: string, patch: any) =>
    call<any>(`/applicants/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  listApplications: (q?: string) => call<any[]>(`/applications${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  updateApplicationStatus: (id: string, status: VisaStatus, note?: string, agent?: string, priority?: Priority) =>
    call<any>(`/applications/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, note, agent, priority }),
    }),
  listMessagesFor: (applicantId: string) => call<any[]>(`/messages/${applicantId}`),
  adminReply: (applicantId: string, body: string, subject?: string) =>
    call<any>(`/messages/${applicantId}/reply`, {
      method: 'POST', body: JSON.stringify({ body, subject }),
    }),
  listRequirements: () => call<any[]>('/requirements'),
  upsertRequirement: (row: any) =>
    call<any>('/requirements', { method: 'POST', body: JSON.stringify(row) }),
  deleteRequirement: (id: string) =>
    call<any>(`/requirements/${id}`, { method: 'DELETE' }),
  listTemplates: () => call<any[]>('/templates'),
  updateTemplate: (name: string, subject: string, body: string) =>
    call<any>('/templates', { method: 'PATCH', body: JSON.stringify({ template_name: name, subject, email_body: body }) }),
  exportReport: () => call<{ url: string }>('/export'),
}
