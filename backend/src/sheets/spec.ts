export type SheetName =
  | 'Applicants'
  | 'Visa Applications'
  | 'Visa Requirements'
  | 'Documents'
  | 'Payments'
  | 'Email Templates'
  | 'Messages'
  | 'Notifications'
  | 'Application History'

export interface SheetSpec {
  name: SheetName
  headers: string[]
}

export const SHEETS: SheetSpec[] = [
  {
    name: 'Applicants',
    headers: ['id', 'full_name', 'email', 'password_hash', 'phone', 'country', 'nationality', 'passport_number', 'date_of_birth', 'created_at', 'status', 'role'],
  },
  {
    name: 'Visa Applications',
    headers: ['application_id', 'applicant_id', 'visa_country', 'visa_type', 'status', 'assigned_agent', 'priority', 'created_at', 'updated_at', 'notes'],
  },
  {
    name: 'Visa Requirements',
    headers: ['country', 'visa_type', 'documents', 'processing_time', 'fees', 'eligibility', 'steps', 'embassy_information'],
  },
  {
    name: 'Documents',
    headers: ['document_id', 'applicant_id', 'document_name', 'file_url', 'verification_status', 'uploaded_at'],
  },
  {
    name: 'Payments',
    headers: ['payment_id', 'applicant_id', 'amount', 'currency', 'status', 'date', 'invoice_number', 'application_id'],
  },
  {
    name: 'Email Templates',
    headers: ['template_id', 'name', 'subject', 'html_body'],
  },
  {
    name: 'Messages',
    headers: ['message_id', 'applicant_id', 'sender', 'sender_role', 'subject', 'message', 'date', 'read_by_applicant', 'read_by_admin'],
  },
  {
    name: 'Notifications',
    headers: ['notification_id', 'applicant_id', 'title', 'message', 'read_status', 'created_at', 'type'],
  },
  {
    name: 'Application History',
    headers: ['history_id', 'application_id', 'old_status', 'new_status', 'changed_by', 'date', 'note'],
  },
]

export const SHEET_NAMES = SHEETS.map(s => s.name)

export const headersFor = (name: SheetName): string[] =>
  SHEETS.find(s => s.name === name)?.headers ?? []
