import { google } from 'googleapis'
import { nanoid } from 'nanoid'

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID || ''
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || ''
const PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '')
  .replace(/\\n/g, '\n')

if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
  console.warn('[googleSheetsService] Missing Google credentials. Set GOOGLE_SHEET_ID, GOOGLE_CLIENT_EMAIL, and GOOGLE_PRIVATE_KEY in .env')
}

const auth = new (google.auth as any).GoogleAuth({
  credentials: CLIENT_EMAIL && PRIVATE_KEY ? {
    client_email: CLIENT_EMAIL,
    private_key: PRIVATE_KEY,
  } : undefined,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
  ],
})

const sheets = google.sheets({ version: 'v4', auth })

export type Row = Record<string, string | number>

const SHEET_HEADERS: Record<string, string[]> = {
  Applicants: ['id', 'full_name', 'email', 'password_hash', 'phone', 'country', 'nationality', 'passport_number', 'date_of_birth', 'created_at', 'status', 'role'],
  'Visa Applications': ['application_id', 'applicant_id', 'visa_country', 'visa_type', 'status', 'assigned_agent', 'priority', 'created_at', 'updated_at', 'notes'],
  'Visa Requirements': ['country', 'visa_type', 'documents', 'processing_time', 'fees', 'eligibility', 'steps', 'embassy_information'],
  Documents: ['document_id', 'applicant_id', 'document_name', 'file_url', 'verification_status', 'uploaded_at'],
  Payments: ['payment_id', 'applicant_id', 'amount', 'currency', 'status', 'date', 'invoice_number', 'application_id'],
  'Email Templates': ['template_id', 'name', 'subject', 'html_body'],
  Messages: ['message_id', 'applicant_id', 'sender', 'sender_role', 'subject', 'message', 'date', 'read_by_applicant', 'read_by_admin'],
  Notifications: ['notification_id', 'applicant_id', 'title', 'message', 'read_status', 'created_at', 'type'],
  'Application History': ['history_id', 'application_id', 'old_status', 'new_status', 'changed_by', 'date', 'note'],
  Admins: ['admin_id', 'full_name', 'email', 'password_hash', 'role', 'created_at', 'last_login', 'status'],
}

function genId(prefix: string): string {
  return `${prefix}_${nanoid(12)}`
}

function toRowArray(row: Record<string, string | number | undefined>, headers: string[]): (string | number)[] {
  return headers.map(h => (row[h] !== undefined && row[h] !== null ? String(row[h]) : ''))
}

function toRowObject(values: any[], headers: string[]): Row {
  const obj: Row = {}
  headers.forEach((h, i) => { obj[h] = (values[i] ?? '') as string | number })
  return obj
}

async function ensureSheet(sheetName: string): Promise<void> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
  const exists = meta.data.sheets?.some(s => s.properties?.title === sheetName)
  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: [{ addSheet: { properties: { title: sheetName } } }] },
    })
    const headers = SHEET_HEADERS[sheetName]
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    })
  }
}

async function readAll(sheetName: string): Promise<Row[]> {
  await ensureSheet(sheetName)
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: sheetName })
  const values = res.data.values || []
  if (values.length < 2) return []
  const headers = values[0] as string[]
  return values.slice(1).map(v => toRowObject(v, headers))
}

async function readRow(sheetName: string, predicate: (r: Row) => boolean): Promise<Row | null> {
  const rows = await readAll(sheetName)
  return rows.find(predicate) || null
}

async function readRows(sheetName: string, predicate: (r: Row) => boolean): Promise<Row[]> {
  const rows = await readAll(sheetName)
  return rows.filter(predicate)
}

async function appendRow(sheetName: string, row: Row): Promise<Row> {
  await ensureSheet(sheetName)
  const headers = SHEET_HEADERS[sheetName]
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:A`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [toRowArray(row, headers)] },
  })
  return row
}

async function updateRow(sheetName: string, predicate: (r: Row) => boolean, patch: Partial<Row>): Promise<Row | null> {
  await ensureSheet(sheetName)
  const headers = SHEET_HEADERS[sheetName]
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: sheetName })
  const values = res.data.values || []
  if (values.length < 2) return null
  const allRows = values.slice(1).map(v => toRowObject(v, headers))
  const rowIndex = allRows.findIndex(predicate)
  if (rowIndex === -1) return null
  const merged: Row = { ...allRows[rowIndex], ...patch } as Row
  const sheetRowIndex = rowIndex + 2
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A${sheetRowIndex}:${String.fromCharCode(65 + headers.length - 1)}${sheetRowIndex}`,
    valueInputOption: 'RAW',
    requestBody: { values: [toRowArray(merged, headers)] },
  })
  return merged
}

async function updateRows(sheetName: string, predicate: (r: Row) => boolean, patch: Partial<Row>): Promise<number> {
  await ensureSheet(sheetName)
  const headers = SHEET_HEADERS[sheetName]
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: sheetName })
  const values = res.data.values || []
  if (values.length < 2) return 0
  const allRows = values.slice(1).map(v => toRowObject(v, headers))
  let count = 0
  const newValues = allRows.map((row, i) => {
    if (predicate(row)) {
      count++
      return toRowArray({ ...row, ...patch }, headers)
    }
    return toRowArray(row, headers)
  })
  if (count > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A2:${String.fromCharCode(65 + headers.length - 1)}${newValues.length + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: newValues },
    })
  }
  return count
}

async function deleteRow(sheetName: string, predicate: (r: Row) => boolean): Promise<boolean> {
  await ensureSheet(sheetName)
  const headers = SHEET_HEADERS[sheetName]
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: sheetName })
  const values = res.data.values || []
  if (values.length < 2) return false
  const allRows = values.slice(1).map(v => toRowObject(v, headers))
  const rowIndex = allRows.findIndex(predicate)
  if (rowIndex === -1) return false
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { requests: [{ deleteDimension: { range: { sheetId: 0, dimension: 'ROWS', startIndex: rowIndex + 1, endIndex: rowIndex + 2 } } }] },
  })
  return true
}

function now(): string {
  return new Date().toISOString()
}

export const googleSheetsService = {
  // ─── APPLICANTS ───
  async getApplicants(): Promise<Row[]> {
    return readAll('Applicants')
  },
  async getApplicant(id: string): Promise<Row | null> {
    return readRow('Applicants', r => r.id === id)
  },
  async getApplicantByEmail(email: string): Promise<Row | null> {
    return readRow('Applicants', r => String(r.email).toLowerCase() === email.toLowerCase())
  },
  async createApplicant(data: Partial<Row>): Promise<Row> {
    const row: Row = {
      id: data.id || genId('APP'),
      full_name: data.full_name || '',
      email: data.email || '',
      password_hash: data.password_hash || '',
      phone: data.phone || '',
      country: data.country || '',
      nationality: data.nationality || '',
      passport_number: data.passport_number || '',
      date_of_birth: data.date_of_birth || '',
      created_at: data.created_at || now(),
      status: data.status || 'active',
      role: data.role || 'applicant',
    }
    return appendRow('Applicants', row)
  },
  async updateApplicant(id: string, patch: Partial<Row>): Promise<Row | null> {
    return updateRow('Applicants', r => r.id === id, patch)
  },
  async deleteApplicant(id: string): Promise<boolean> {
    return deleteRow('Applicants', r => r.id === id)
  },

  // ─── VISA APPLICATIONS ───
  async getVisaApplications(): Promise<Row[]> {
    return readAll('Visa Applications')
  },
  async getVisaApplication(id: string): Promise<Row | null> {
    return readRow('Visa Applications', r => r.application_id === id)
  },
  async getApplicationsByApplicant(applicantId: string): Promise<Row[]> {
    return readRows('Visa Applications', r => r.applicant_id === applicantId)
  },
  async createVisaApplication(data: Partial<Row>): Promise<Row> {
    const ts = now()
    const row: Row = {
      application_id: data.application_id || genId('VISA'),
      applicant_id: data.applicant_id || '',
      visa_country: data.visa_country || '',
      visa_type: data.visa_type || '',
      status: data.status || 'Submitted',
      assigned_agent: data.assigned_agent || '',
      priority: data.priority || 'Normal',
      created_at: data.created_at || ts,
      updated_at: ts,
      notes: data.notes || '',
    }
    return appendRow('Visa Applications', row)
  },
  async updateVisaStatus(id: string, status: string, note?: string): Promise<Row | null> {
    return updateRow('Visa Applications', r => r.application_id === id, { status, updated_at: now(), notes: note || '' })
  },
  async updateVisaApplication(id: string, patch: Partial<Row>): Promise<Row | null> {
    return updateRow('Visa Applications', r => r.application_id === id, { ...patch, updated_at: now() })
  },

  // ─── VISA REQUIREMENTS ───
  async getVisaRequirements(): Promise<Row[]> {
    return readAll('Visa Requirements')
  },
  async getVisaRequirementsForCountry(country: string): Promise<Row[]> {
    return readRows('Visa Requirements', r => String(r.country).toLowerCase() === country.toLowerCase())
  },
  async getVisaRequirement(country: string, visaType: string): Promise<Row | null> {
    return readRow('Visa Requirements', r =>
      String(r.country).toLowerCase() === country.toLowerCase() &&
      String(r.visa_type).toLowerCase() === visaType.toLowerCase()
    )
  },
  async upsertVisaRequirement(data: Partial<Row>): Promise<Row> {
    const existing = await this.getVisaRequirement(String(data.country), String(data.visa_type))
    if (existing) {
      const merged = { ...existing, ...data } as Row
      await updateRow('Visa Requirements', r =>
        String(r.country).toLowerCase() === String(data.country).toLowerCase() &&
        String(r.visa_type).toLowerCase() === String(data.visa_type).toLowerCase(),
        data as Row)
      return merged
    }
    return appendRow('Visa Requirements', data as Row)
  },
  async updateVisaRequirement(country: string, visaType: string, patch: Partial<Row>): Promise<Row | null> {
    return updateRow('Visa Requirements', r =>
      String(r.country).toLowerCase() === country.toLowerCase() &&
      String(r.visa_type).toLowerCase() === visaType.toLowerCase(),
      patch)
  },
  async deleteVisaRequirement(country: string, visaType: string): Promise<boolean> {
    return deleteRow('Visa Requirements', r =>
      String(r.country).toLowerCase() === country.toLowerCase() &&
      String(r.visa_type).toLowerCase() === visaType.toLowerCase()
    )
  },

  // ─── DOCUMENTS ───
  async getDocuments(): Promise<Row[]> {
    return readAll('Documents')
  },
  async getDocumentsByApplicant(applicantId: string): Promise<Row[]> {
    return readRows('Documents', r => r.applicant_id === applicantId)
  },
  async getDocument(id: string): Promise<Row | null> {
    return readRow('Documents', r => r.document_id === id)
  },
  async addDocument(data: Partial<Row>): Promise<Row> {
    const row: Row = {
      document_id: data.document_id || genId('DOC'),
      applicant_id: data.applicant_id || '',
      document_name: data.document_name || '',
      file_url: data.file_url || '',
      verification_status: data.verification_status || 'Pending',
      uploaded_at: data.uploaded_at || now(),
    }
    return appendRow('Documents', row)
  },
  async updateDocumentStatus(id: string, status: string): Promise<Row | null> {
    return updateRow('Documents', r => r.document_id === id, { verification_status: status })
  },

  // ─── PAYMENTS ───
  async getPayments(): Promise<Row[]> {
    return readAll('Payments')
  },
  async getPaymentsByApplicant(applicantId: string): Promise<Row[]> {
    return readRows('Payments', r => r.applicant_id === applicantId)
  },
  async getPayment(id: string): Promise<Row | null> {
    return readRow('Payments', r => r.payment_id === id)
  },
  async createPayment(data: Partial<Row>): Promise<Row> {
    const row: Row = {
      payment_id: data.payment_id || genId('PAY'),
      applicant_id: data.applicant_id || '',
      amount: data.amount || 0,
      currency: data.currency || 'USD',
      status: data.status || 'Pending',
      date: data.date || now(),
      invoice_number: data.invoice_number || `INV-${Date.now()}`,
      application_id: data.application_id || '',
    }
    return appendRow('Payments', row)
  },
  async updatePayment(id: string, patch: Partial<Row>): Promise<Row | null> {
    return updateRow('Payments', r => r.payment_id === id, patch)
  },

  // ─── EMAIL TEMPLATES ───
  async getEmailTemplates(): Promise<Row[]> {
    return readAll('Email Templates')
  },
  async getEmailTemplate(name: string): Promise<Row | null> {
    return readRow('Email Templates', r => String(r.name).toLowerCase() === name.toLowerCase())
  },
  async updateEmailTemplate(name: string, subject: string, htmlBody: string): Promise<Row | null> {
    return updateRow('Email Templates', r => String(r.name).toLowerCase() === name.toLowerCase(), { subject, html_body: htmlBody })
  },

  // ─── MESSAGES ───
  async getMessagesByApplicant(applicantId: string): Promise<Row[]> {
    return readRows('Messages', r => r.applicant_id === applicantId)
  },
  async addMessage(data: Partial<Row>): Promise<Row> {
    const row: Row = {
      message_id: data.message_id || genId('MSG'),
      applicant_id: data.applicant_id || '',
      sender: data.sender || '',
      sender_role: data.sender_role || 'applicant',
      subject: data.subject || '',
      message: data.message || '',
      date: data.date || now(),
      read_by_applicant: data.read_by_applicant ?? 'false',
      read_by_admin: data.read_by_admin ?? 'false',
    }
    return appendRow('Messages', row)
  },
  async markMessagesReadByAdmin(applicantId: string): Promise<number> {
    return updateRows('Messages', r => r.applicant_id === applicantId && r.sender_role === 'applicant', { read_by_admin: 'true' })
  },
  async markMessagesReadByApplicant(applicantId: string): Promise<number> {
    return updateRows('Messages', r => r.applicant_id === applicantId && r.sender_role !== 'applicant', { read_by_applicant: 'true' })
  },

  // ─── NOTIFICATIONS ───
  async getNotificationsByApplicant(applicantId: string): Promise<Row[]> {
    return readRows('Notifications', r => r.applicant_id === applicantId)
  },
  async addNotification(data: Partial<Row>): Promise<Row> {
    const row: Row = {
      notification_id: data.notification_id || genId('NOT'),
      applicant_id: data.applicant_id || '',
      title: data.title || '',
      message: data.message || '',
      read_status: data.read_status || 'false',
      created_at: data.created_at || now(),
      type: data.type || 'general',
    }
    return appendRow('Notifications', row)
  },
  async markNotificationRead(id: string): Promise<Row | null> {
    return updateRow('Notifications', r => r.notification_id === id, { read_status: 'true' })
  },
  async markAllNotificationsRead(applicantId: string): Promise<number> {
    return updateRows('Notifications', r => r.applicant_id === applicantId, { read_status: 'true' })
  },

  // ─── APPLICATION HISTORY ───
  async getApplicationHistory(applicationId: string): Promise<Row[]> {
    return readRows('Application History', r => r.application_id === applicationId)
  },
  async addApplicationHistory(data: Partial<Row>): Promise<Row> {
    const row: Row = {
      history_id: data.history_id || genId('HIST'),
      application_id: data.application_id || '',
      old_status: data.old_status || '',
      new_status: data.new_status || '',
      changed_by: data.changed_by || '',
      date: data.date || now(),
      note: data.note || '',
    }
    return appendRow('Application History', row)
  },

  // ─── ADMINS ───
  async getAdmins(): Promise<Row[]> {
    return readAll('Admins')
  },
  async getAdmin(id: string): Promise<Row | null> {
    return readRow('Admins', r => r.admin_id === id)
  },
  async getAdminByEmail(email: string): Promise<Row | null> {
    return readRow('Admins', r => String(r.email).toLowerCase() === email.toLowerCase())
  },
  async createAdmin(data: Partial<Row>): Promise<Row> {
    const row: Row = {
      admin_id: data.admin_id || genId('ADM'),
      full_name: data.full_name || '',
      email: data.email || '',
      password_hash: data.password_hash || '',
      role: data.role || 'agent',
      created_at: data.created_at || now(),
      last_login: data.last_login || '',
      status: data.status || 'active',
    }
    return appendRow('Admins', row)
  },
  async updateAdmin(id: string, patch: Partial<Row>): Promise<Row | null> {
    return updateRow('Admins', r => r.admin_id === id, patch)
  },
  async updateAdminLastLogin(id: string): Promise<Row | null> {
    return updateRow('Admins', r => r.admin_id === id, { last_login: now() })
  },
  async deleteAdmin(id: string): Promise<boolean> {
    return deleteRow('Admins', r => r.admin_id === id)
  },

  // ─── RAW ACCESS ───
  readAll,
  readRow,
  readRows,
  appendRow,
  updateRow,
  updateRows,
  deleteRow,
  genId,
  now,
}
