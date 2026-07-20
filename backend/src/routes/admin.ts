import { Router } from 'express'
import {
  getApplicants, getApplicant, updateApplicant,
  getVisaApplications, getVisaApplication, updateVisaStatus,
  getDocuments, getPayments, getEmailTemplates, updateEmailTemplate,
  getMessagesByApplicant, addMessage, markMessagesReadByAdmin,
  getVisaRequirements, upsertVisaRequirement, deleteVisaRequirement, updateVisaRequirement,
  addApplicationHistory, addNotification,
} from '../services/googleSheetsService.js'
import { authMiddleware, requireRole } from '../auth/jwt.js'
import { notifyApplicant, buildAppApplicationVars } from '../services/notifyService.js'
import type { Request, Response } from 'express'

export const adminRouter = Router()
adminRouter.use(authMiddleware)
adminRouter.use(requireRole('admin', 'agent'))

// Stats
adminRouter.get('/stats', async (_req: Request, res: Response) => {
  const [applicants, apps, docs, payments] = await Promise.all([
    getApplicants(), getVisaApplications(), getDocuments(), getPayments(),
  ])
  const byStatus = new Map<string, number>()
  const byCountry = new Map<string, number>()
  let active = 0, completed = 0
  for (const a of apps) {
    byStatus.set(a.status, (byStatus.get(a.status) ?? 0) + 1)
    byCountry.set(a.visa_country, (byCountry.get(a.visa_country) ?? 0) + 1)
    if (!['Approved', 'Rejected', 'Completed'].includes(a.status)) active++
    if (['Approved', 'Completed'].includes(a.status)) completed++
  }
  const pendingDocs = docs.filter(d => d.verification_status === 'Pending').length
  const revenue = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + Number(p.amount), 0)
  const last7: { date: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    last7.push({ date: ds, count: apps.filter(a => a.created_at?.slice(0, 10) === ds).length })
  }
  res.json({
    totalApplicants: applicants.length,
    activeApplications: active,
    completedVisas: completed,
    pendingDocuments: pendingDocs,
    revenue, revenueCurrency: 'USD',
    byStatus: Array.from(byStatus.entries()).map(([status, count]) => ({ status, count })),
    byCountry: Array.from(byCountry.entries()).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count).slice(0, 8),
    last7Days: last7,
  })
})

// Applicants
adminRouter.get('/applicants', async (req: Request, res: Response) => {
  const q = (req.query.q as string ?? '').toLowerCase()
  let rows = await getApplicants()
  if (q) rows = rows.filter(a =>
    a.full_name?.toLowerCase().includes(q) ||
    a.email?.toLowerCase().includes(q) ||
    a.country?.toLowerCase().includes(q))
  res.json(rows.map(({ password_hash, ...rest }) => rest))
})

adminRouter.get('/applicants/:id', async (req: Request, res: Response) => {
  const a = await getApplicant(req.params.id)
  if (!a) return res.status(404).json({ error: 'Not found' })
  const apps = await getVisaApplications().then(all => all.filter(x => x.applicant_id === a.id))
  const { password_hash, ...rest } = a
  res.json({ ...rest, applications: apps })
})

adminRouter.patch('/applicants/:id', async (req: Request, res: Response) => {
  const patch = { ...req.body }
  delete patch.password_hash
  delete patch.id
  delete patch.email
  const updated = await updateApplicant(req.params.id, patch)
  if (!updated) return res.status(404).json({ error: 'Not found' })
  const { password_hash, ...rest } = updated
  res.json(rest)
})

// Applications
adminRouter.get('/applications', async (req: Request, res: Response) => {
  const q = (req.query.q as string ?? '').toLowerCase()
  const apps = await getVisaApplications()
  const applicants = await getApplicants()
  const map = new Map(applicants.map(a => [a.id, a]))
  let rows = apps.map(a => ({
    ...a,
    applicant_name: map.get(a.applicant_id)?.full_name ?? '',
    applicant_email: map.get(a.applicant_id)?.email ?? '',
  }))
  if (q) rows = rows.filter(r =>
    r.application_id?.toLowerCase().includes(q) ||
    r.visa_country?.toLowerCase().includes(q) ||
    r.applicant_name?.toLowerCase().includes(q) ||
    r.applicant_email?.toLowerCase().includes(q))
  res.json(rows)
})

adminRouter.post('/applications/:id/status', async (req: Request, res: Response) => {
  const user = (req as any).user
  const { status, note, assigned_agent, priority } = req.body ?? {}
  const app = await getVisaApplication(req.params.id)
  if (!app) return res.status(404).json({ error: 'Application not found' })
  const prev = app.status
  const updated = await updateVisaStatus(req.params.id, status, { assigned_agent, priority, notes: note })
  await addApplicationHistory({
    application_id: req.params.id, old_status: prev, new_status: status,
    changed_by: user.name, note,
  })
  const applicant = await getApplicant(app.applicant_id)
  if (applicant) {
    const event = status === 'Approved' ? 'visa_approved' : status === 'Rejected' ? 'visa_rejected' : 'status_update'
    await notifyApplicant({
      applicant,
      templateName: event,
      vars: buildAppApplicationVars(applicant, updated ?? app, { previous_status: prev, new_status: status, note: note ?? '' }),
      title: `Application status: ${status}`,
      message: note || `Your application status changed to ${status}.`,
    })
  }
  res.json({ ok: true, application: updated })
})

// Documents
adminRouter.get('/documents', async (_req: Request, res: Response) => {
  res.json(await getDocuments())
})

adminRouter.post('/documents/:id/verify', async (req: Request, res: Response) => {
  const { status } = req.body ?? {}
  const { updateDocumentStatus } = await import('../services/googleSheetsService.js')
  await updateDocumentStatus(req.params.id, status ?? 'Verified')
  res.json({ ok: true })
})

// Payments
adminRouter.get('/payments', async (_req: Request, res: Response) => {
  res.json(await getPayments())
})

// Messages
adminRouter.get('/messages/:applicantId', async (req: Request, res: Response) => {
  const msgs = await getMessagesByApplicant(req.params.applicantId)
  await markMessagesReadByAdmin(req.params.applicantId).catch(() => null)
  res.json(msgs)
})

adminRouter.post('/messages/:applicantId/reply', async (req: Request, res: Response) => {
  const user = (req as any).user
  const { subject, message } = req.body ?? {}
  if (!message) return res.status(400).json({ error: 'message is required' })
  const msg = await addMessage({
    applicant_id: req.params.applicantId, sender: user.name,
    sender_role: user.role === 'agent' ? 'agent' : 'admin', subject, message,
  })
  const applicant = await getApplicant(req.params.applicantId)
  if (applicant) {
    await addNotification({
      applicant_id: applicant.id, title: 'New message from your agent',
      message, type: 'message',
    }).catch(() => null)
  }
  res.status(201).json(msg)
})

// Visa requirements
adminRouter.get('/requirements', async (_req: Request, res: Response) => {
  res.json(await getVisaRequirements())
})

adminRouter.post('/requirements', async (req: Request, res: Response) => {
  const row = req.body ?? {}
  if (!row.country || !row.visa_type) return res.status(400).json({ error: 'country and visa_type are required' })
  res.status(201).json(await upsertVisaRequirement(row))
})

adminRouter.patch('/requirements', async (req: Request, res: Response) => {
  const { country, visa_type, ...patch } = req.body ?? {}
  if (!country || !visa_type) return res.status(400).json({ error: 'country and visa_type are required' })
  await updateVisaRequirement(country, visa_type, patch)
  res.json({ ok: true })
})

adminRouter.delete('/requirements', async (req: Request, res: Response) => {
  const country = req.query.country as string
  const visa_type = req.query.visa_type as string
  if (!country || !visa_type) return res.status(400).json({ error: 'country and visa_type are required' })
  await deleteVisaRequirement(country, visa_type)
  res.json({ ok: true })
})

// Email templates
adminRouter.get('/templates', async (_req: Request, res: Response) => {
  res.json(await getEmailTemplates())
})

adminRouter.patch('/templates', async (req: Request, res: Response) => {
  const { name, subject, html_body } = req.body ?? {}
  if (!name) return res.status(400).json({ error: 'name is required' })
  await updateEmailTemplate(name, { subject, html_body })
  res.json({ ok: true })
})

// Export CSV
adminRouter.get('/export', async (_req: Request, res: Response) => {
  const apps = await getVisaApplications()
  const header = 'Application ID,Applicant ID,Country,Visa Type,Status,Agent,Priority,Created,Updated\n'
  const rows = apps.map(a => [a.application_id, a.applicant_id, a.visa_country, a.visa_type, a.status, a.assigned_agent, a.priority, a.created_at, a.updated_at].map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="meta-online-service-report.csv"')
  res.send(header + rows)
})
