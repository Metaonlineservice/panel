import type {
  Applicant, VisaApplication, VisaRequirement, DocumentRecord,
  Payment, Message, ApplicationHistory, Notification, Admin,
  VisaStatus, Priority,
} from './types'
import { supabase } from './supabase'

function genCode(prefix: string): string {
  const t = Date.now().toString(36).toUpperCase().slice(-6)
  const r = Math.random().toString(36).toUpperCase().slice(2, 6)
  return `${prefix}-${t}${r}`
}

export const db = {
  // ---------- Applicants ----------
  async getApplicant(userId: string): Promise<Applicant | null> {
    const { data, error } = await supabase
      .from('applicants').select('*').eq('user_id', userId).maybeSingle()
    if (error) throw error
    return data
  },

  async createApplicant(input: {
    userId: string, fullName: string, email: string, phone?: string,
    country?: string, passportNumber?: string, nationality?: string, dateOfBirth?: string,
  }): Promise<Applicant> {
    const { data, error } = await supabase.from('applicants').insert({
      user_id: input.userId,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone ?? null,
      country: input.country ?? null,
      passport_number: input.passportNumber ?? null,
      nationality: input.nationality ?? null,
      date_of_birth: input.dateOfBirth ?? null,
    }).select().single()
    if (error) throw error
    return data
  },

  async updateApplicant(userId: string, patch: Partial<Applicant>): Promise<Applicant> {
    const { data, error } = await supabase
      .from('applicants').update(patch).eq('user_id', userId).select().single()
    if (error) throw error
    return data
  },

  // ---------- Visa Applications ----------
  async listMyApplications(userId: string): Promise<VisaApplication[]> {
    const { data, error } = await supabase
      .from('visa_applications').select('*')
      .eq('user_id', userId).order('application_date', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async getApplication(id: string): Promise<VisaApplication | null> {
    const { data, error } = await supabase
      .from('visa_applications').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data
  },

  async createVisaApplication(input: {
    userId: string, applicantId: string, visaCountry: string, visaType: string,
    priority?: Priority, notes?: string,
  }): Promise<VisaApplication> {
    const { data, error } = await supabase.from('visa_applications').insert({
      user_id: input.userId,
      applicant_id: input.applicantId,
      application_code: genCode('V'),
      visa_country: input.visaCountry,
      visa_type: input.visaType,
      priority: input.priority ?? 'Normal',
      notes: input.notes ?? null,
    }).select().single()
    if (error) throw error
    return data
  },

  // ---------- Documents ----------
  async listMyDocuments(userId: string): Promise<DocumentRecord[]> {
    const { data, error } = await supabase
      .from('documents').select('*').eq('user_id', userId)
      .order('upload_date', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async uploadDocumentRecord(input: {
    userId: string, applicantId: string, applicationId?: string,
    documentName: string, uploadLink?: string,
  }): Promise<DocumentRecord> {
    const { data, error } = await supabase.from('documents').insert({
      user_id: input.userId,
      applicant_id: input.applicantId,
      application_id: input.applicationId ?? null,
      document_name: input.documentName,
      upload_link: input.uploadLink ?? null,
    }).select().single()
    if (error) throw error
    return data
  },

  // ---------- Payments ----------
  async listMyPayments(userId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments').select('*').eq('user_id', userId)
      .order('payment_date', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  // ---------- Messages ----------
  async listMyMessages(userId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages').select('*').eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async sendMessage(input: {
    userId: string, applicantId: string, sender: string,
    subject?: string, body: string,
  }): Promise<Message> {
    const { data, error } = await supabase.from('messages').insert({
      user_id: input.userId,
      applicant_id: input.applicantId,
      sender: input.sender,
      sender_role: 'applicant',
      subject: input.subject ?? null,
      body: input.body,
      read_by_applicant: true,
      read_by_admin: false,
    }).select().single()
    if (error) throw error
    return data
  },

  // ---------- History ----------
  async listApplicationHistory(applicationId: string): Promise<ApplicationHistory[]> {
    const { data, error } = await supabase
      .from('application_history').select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  // ---------- Notifications ----------
  async listNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications').select('*').eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async markNotificationRead(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
    if (error) throw error
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
    if (error) throw error
  },

  // ---------- Visa Requirements ----------
  async listRequirements(): Promise<VisaRequirement[]> {
    const { data, error } = await supabase
      .from('visa_requirements').select('*').order('country', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async listCountries(): Promise<{ country: string; country_code: string | null }[]> {
    const { data, error } = await supabase
      .from('visa_requirements').select('country, country_code')
      .order('country', { ascending: true })
    if (error) throw error
    const map = new Map<string, string | null>()
    for (const r of data ?? []) map.set(r.country, r.country_code)
    return Array.from(map.entries()).map(([country, country_code]) => ({ country, country_code }))
  },

  // ---------- Admin ----------
  async getAdmin(userId: string): Promise<Admin | null> {
    const { data, error } = await supabase
      .from('admins').select('*').eq('user_id', userId).maybeSingle()
    if (error) throw error
    return data
  },

  // Admin-scoped reads via edge function (service role) — see adminApi.
}

export type Db = typeof db
