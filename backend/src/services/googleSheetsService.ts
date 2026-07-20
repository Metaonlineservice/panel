import { nanoid } from 'nanoid'
import {
  appendRow, readAll, findRow, findRows, updateRows, deleteRows,
} from '../sheets/repository.js'

const now = () => new Date().toISOString()
const id = (prefix: string) => `${prefix}_${nanoid(12)}`

// ---------- Applicants ----------

export interface Applicant {
  id: string
  full_name: string
  email: string
  password_hash: string
  phone: string
  country: string
  nationality: string
  passport_number: string
  date_of_birth: string
  created_at: string
  status: string
  role: 'applicant' | 'admin' | 'agent'
}

export async function getApplicants(): Promise<Applicant[]> {
  return readAll<Applicant>('Applicants')
}

export async function getApplicant(id: string): Promise<Applicant | null> {
  return findRow<Applicant>('Applicants', a => a.id === id)
}

export async function getApplicantByEmail(email: string): Promise<Applicant | null> {
  return findRow<Applicant>('Applicants', a => a.email.toLowerCase() === email.toLowerCase())
}

export async function createApplicant(input: Omit<Applicant, 'id' | 'created_at' | 'status' | 'role'> & Partial<Pick<Applicant, 'status' | 'role'>>): Promise<Applicant> {
  const row: Applicant = {
    id: id('APP'),
    full_name: input.full_name,
    email: input.email,
    password_hash: input.password_hash,
    phone: input.phone ?? '',
    country: input.country ?? '',
    nationality: input.nationality ?? '',
    passport_number: input.passport_number ?? '',
    date_of_birth: input.date_of_birth ?? '',
    created_at: now(),
    status: input.status ?? 'active',
    role: input.role ?? 'applicant',
  }
  return appendRow<Applicant>('Applicants', row as any)
}

export async function updateApplicant(id: string, patch: Partial<Applicant>): Promise<Applicant | null> {
  await updateRows<Applicant>('Applicants', a => a.id === id, () => patch as any)
  return getApplicant(id)
}

export async function deleteApplicant(id: string): Promise<number> {
  return deleteRows<Applicant>('Applicants', a => a.id === id)
}

// ---------- Visa Applications ----------

export interface VisaApplication {
  application_id: string
  applicant_id: string
  visa_country: string
  visa_type: string
  status: string
  assigned_agent: string
  priority: string
  created_at: string
  updated_at: string
  notes: string
}

export async function getVisaApplications(): Promise<VisaApplication[]> {
  return readAll<VisaApplication>('Visa Applications')
}

export async function getVisaApplication(applicationId: string): Promise<VisaApplication | null> {
  return findRow<VisaApplication>('Visa Applications', a => a.application_id === applicationId)
}

export async function getApplicationsByApplicant(applicantId: string): Promise<VisaApplication[]> {
  return findRows<VisaApplication>('Visa Applications', a => a.applicant_id === applicantId)
}

export async function createVisaApplication(input: {
  applicant_id: string
  visa_country: string
  visa_type: string
  priority?: string
  notes?: string
}): Promise<VisaApplication> {
  const row: VisaApplication = {
    application_id: id('VISA'),
    applicant_id: input.applicant_id,
    visa_country: input.visa_country,
    visa_type: input.visa_type,
    status: 'Submitted',
    assigned_agent: '',
    priority: input.priority ?? 'Normal',
    created_at: now(),
    updated_at: now(),
    notes: input.notes ?? '',
  }
  return appendRow<VisaApplication>('Visa Applications', row as any)
}

export async function updateVisaStatus(applicationId: string, status: string, opts?: { assigned_agent?: string; priority?: string; notes?: string }): Promise<VisaApplication | null> {
  await updateRows<VisaApplication>('Visa Applications', a => a.application_id === applicationId, (row) => ({
    status,
    assigned_agent: opts?.assigned_agent ?? row.assigned_agent,
    priority: opts?.priority ?? row.priority,
    notes: opts?.notes ?? row.notes,
    updated_at: now(),
  } as any))
  return getVisaApplication(applicationId)
}

// ---------- Documents ----------

export interface DocumentRecord {
  document_id: string
  applicant_id: string
  document_name: string
  file_url: string
  verification_status: string
  uploaded_at: string
}

export async function getDocuments(): Promise<DocumentRecord[]> {
  return readAll<DocumentRecord>('Documents')
}

export async function getDocumentsByApplicant(applicantId: string): Promise<DocumentRecord[]> {
  return findRows<DocumentRecord>('Documents', d => d.applicant_id === applicantId)
}

export async function addDocument(input: {
  applicant_id: string
  document_name: string
  file_url: string
  verification_status?: string
}): Promise<DocumentRecord> {
  const row: DocumentRecord = {
    document_id: id('DOC'),
    applicant_id: input.applicant_id,
    document_name: input.document_name,
    file_url: input.file_url,
    verification_status: input.verification_status ?? 'Pending',
    uploaded_at: now(),
  }
  return appendRow<DocumentRecord>('Documents', row as any)
}

export async function updateDocumentStatus(documentId: string, status: string): Promise<void> {
  await updateRows<DocumentRecord>('Documents', d => d.document_id === documentId, () => ({ verification_status: status } as any))
}

// ---------- Payments ----------

export interface Payment {
  payment_id: string
  applicant_id: string
  amount: string
  currency: string
  status: string
  date: string
  invoice_number: string
  application_id: string
}

export async function getPayments(): Promise<Payment[]> {
  return readAll<Payment>('Payments')
}

export async function getPaymentsByApplicant(applicantId: string): Promise<Payment[]> {
  return findRows<Payment>('Payments', p => p.applicant_id === applicantId)
}

export async function createPayment(input: {
  applicant_id: string
  amount: number | string
  currency?: string
  status?: string
  application_id?: string
}): Promise<Payment> {
  const row: Payment = {
    payment_id: id('PAY'),
    applicant_id: input.applicant_id,
    amount: String(input.amount),
    currency: input.currency ?? 'USD',
    status: input.status ?? 'Pending',
    date: now(),
    invoice_number: `INV-${Date.now().toString(36).toUpperCase()}`,
    application_id: input.application_id ?? '',
  }
  return appendRow<Payment>('Payments', row as any)
}

// ---------- Visa Requirements ----------

export interface VisaRequirement {
  country: string
  visa_type: string
  documents: string
  processing_time: string
  fees: string
  eligibility: string
  steps: string
  embassy_information: string
}

export async function getVisaRequirements(): Promise<VisaRequirement[]> {
  return readAll<VisaRequirement>('Visa Requirements')
}

export async function getVisaRequirementsForCountry(country: string): Promise<VisaRequirement[]> {
  return findRows<VisaRequirement>('Visa Requirements', r => r.country.toLowerCase() === country.toLowerCase())
}

export async function upsertVisaRequirement(input: VisaRequirement): Promise<VisaRequirement> {
  const existing = await findRow<VisaRequirement>('Visa Requirements',
    r => r.country.toLowerCase() === input.country.toLowerCase() && r.visa_type.toLowerCase() === input.visa_type.toLowerCase())
  if (existing) {
    await updateRows<VisaRequirement>('Visa Requirements',
      r => r.country.toLowerCase() === input.country.toLowerCase() && r.visa_type.toLowerCase() === input.visa_type.toLowerCase(),
      () => input as any)
    return input
  }
  return appendRow<VisaRequirement>('Visa Requirements', input as any)
}

export async function updateVisaRequirement(country: string, visaType: string, patch: Partial<VisaRequirement>): Promise<void> {
  await updateRows<VisaRequirement>('Visa Requirements',
    r => r.country.toLowerCase() === country.toLowerCase() && r.visa_type.toLowerCase() === visaType.toLowerCase(),
    () => patch as any)
}

export async function deleteVisaRequirement(country: string, visaType: string): Promise<number> {
  return deleteRows<VisaRequirement>('Visa Requirements',
    r => r.country.toLowerCase() === country.toLowerCase() && r.visa_type.toLowerCase() === visaType.toLowerCase())
}

// ---------- Email Templates ----------

export interface EmailTemplate {
  template_id: string
  name: string
  subject: string
  html_body: string
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  return readAll<EmailTemplate>('Email Templates')
}

export async function getEmailTemplate(name: string): Promise<EmailTemplate | null> {
  return findRow<EmailTemplate>('Email Templates', t => t.name === name)
}

export async function updateEmailTemplate(name: string, patch: { subject?: string; html_body?: string }): Promise<void> {
  await updateRows<EmailTemplate>('Email Templates', t => t.name === name, () => patch as any)
}

// ---------- Messages ----------

export interface Message {
  message_id: string
  applicant_id: string
  sender: string
  sender_role: 'applicant' | 'admin' | 'agent'
  subject: string
  message: string
  date: string
  read_by_applicant: string
  read_by_admin: string
}

export async function getMessagesByApplicant(applicantId: string): Promise<Message[]> {
  return findRows<Message>('Messages', m => m.applicant_id === applicantId)
}

export async function addMessage(input: {
  applicant_id: string
  sender: string
  sender_role: Message['sender_role']
  subject?: string
  message: string
}): Promise<Message> {
  const row: Message = {
    message_id: id('MSG'),
    applicant_id: input.applicant_id,
    sender: input.sender,
    sender_role: input.sender_role,
    subject: input.subject ?? '',
    message: input.message,
    date: now(),
    read_by_applicant: input.sender_role === 'applicant' ? 'true' : 'false',
    read_by_admin: input.sender_role === 'admin' || input.sender_role === 'agent' ? 'true' : 'false',
  }
  return appendRow<Message>('Messages', row as any)
}

export async function markMessagesReadByAdmin(applicantId: string): Promise<void> {
  await updateRows<Message>('Messages', m => m.applicant_id === applicantId && m.sender_role === 'applicant', () => ({ read_by_admin: 'true' } as any))
}

export async function markMessagesReadByApplicant(applicantId: string): Promise<void> {
  await updateRows<Message>('Messages', m => m.applicant_id === applicantId && m.sender_role !== 'applicant', () => ({ read_by_applicant: 'true' } as any))
}

// ---------- Notifications ----------

export interface Notification {
  notification_id: string
  applicant_id: string
  title: string
  message: string
  read_status: string
  created_at: string
  type: string
}

export async function getNotificationsByApplicant(applicantId: string): Promise<Notification[]> {
  return findRows<Notification>('Notifications', n => n.applicant_id === applicantId)
}

export async function addNotification(input: {
  applicant_id: string
  title: string
  message: string
  type?: string
}): Promise<Notification> {
  const row: Notification = {
    notification_id: id('NOT'),
    applicant_id: input.applicant_id,
    title: input.title,
    message: input.message,
    read_status: 'false',
    created_at: now(),
    type: input.type ?? 'info',
  }
  return appendRow<Notification>('Notifications', row as any)
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateRows<Notification>('Notifications', n => n.notification_id === notificationId, () => ({ read_status: 'true' } as any))
}

export async function markAllNotificationsRead(applicantId: string): Promise<void> {
  await updateRows<Notification>('Notifications', n => n.applicant_id === applicantId, () => ({ read_status: 'true' } as any))
}

// ---------- Application History ----------

export interface ApplicationHistory {
  history_id: string
  application_id: string
  old_status: string
  new_status: string
  changed_by: string
  date: string
  note: string
}

export async function getApplicationHistory(applicationId: string): Promise<ApplicationHistory[]> {
  return findRows<ApplicationHistory>('Application History', h => h.application_id === applicationId)
}

export async function addApplicationHistory(input: {
  application_id: string
  old_status: string
  new_status: string
  changed_by: string
  note?: string
}): Promise<ApplicationHistory> {
  const row: ApplicationHistory = {
    history_id: id('HIST'),
    application_id: input.application_id,
    old_status: input.old_status,
    new_status: input.new_status,
    changed_by: input.changed_by,
    date: now(),
    note: input.note ?? '',
  }
  return appendRow<ApplicationHistory>('Application History', row as any)
}
