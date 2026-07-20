import { Router } from 'express'
import {
  getApplicant, updateApplicant, getApplicationsByApplicant,
  getDocumentsByApplicant, getPaymentsByApplicant,
  getNotificationsByApplicant, markAllNotificationsRead, markNotificationRead,
  createVisaApplication, addDocument, addMessage, getMessagesByApplicant,
  markMessagesReadByApplicant,
} from '../services/googleSheetsService.js'
import { authMiddleware } from '../auth/jwt.js'
import { notifyApplicant, buildAppApplicationVars } from '../services/notifyService.js'
import type { Request, Response } from 'express'

export const applicantRouter = Router()
applicantRouter.use(authMiddleware)

// Profile
applicantRouter.get('/me', async (req: Request, res: Response) => {
  const user = (req as any).user
  const a = await getApplicant(user.sub)
  if (!a) return res.status(404).json({ error: 'Profile not found.' })
  const { password_hash, ...rest } = a
  res.json(rest)
})

applicantRouter.patch('/me', async (req: Request, res: Response) => {
  const user = (req as any).user
  const patch = req.body ?? {}
  delete patch.password_hash
  delete patch.email
  delete patch.id
  delete patch.role
  const updated = await updateApplicant(user.sub, patch)
  if (!updated) return res.status(404).json({ error: 'Profile not found.' })
  const { password_hash, ...rest } = updated
  res.json(rest)
})

// Applications
applicantRouter.get('/me/applications', async (req: Request, res: Response) => {
  const user = (req as any).user
  res.json(await getApplicationsByApplicant(user.sub))
})

applicantRouter.post('/me/applications', async (req: Request, res: Response) => {
  const user = (req as any).user
  const { visa_country, visa_type, priority, notes } = req.body ?? {}
  if (!visa_country || !visa_type) return res.status(400).json({ error: 'visa_country and visa_type are required.' })
  const applicant = await getApplicant(user.sub)
  if (!applicant) return res.status(404).json({ error: 'Profile not found.' })
  const app = await createVisaApplication({ applicant_id: user.sub, visa_country, visa_type, priority, notes })
  await notifyApplicant({
    applicant,
    templateName: 'application_received',
    vars: buildAppApplicationVars(applicant, app),
    title: 'Application received',
    message: `Your ${app.visa_type} visa application for ${app.visa_country} has been received.`,
  })
  res.status(201).json(app)
})

// Documents
applicantRouter.get('/me/documents', async (req: Request, res: Response) => {
  const user = (req as any).user
  res.json(await getDocumentsByApplicant(user.sub))
})

applicantRouter.post('/me/documents', async (req: Request, res: Response) => {
  const user = (req as any).user
  const { document_name, file_url } = req.body ?? {}
  if (!document_name || !file_url) return res.status(400).json({ error: 'document_name and file_url are required.' })
  const doc = await addDocument({ applicant_id: user.sub, document_name, file_url })
  res.status(201).json(doc)
})

// Payments
applicantRouter.get('/me/payments', async (req: Request, res: Response) => {
  const user = (req as any).user
  res.json(await getPaymentsByApplicant(user.sub))
})

// Messages
applicantRouter.get('/me/messages', async (req: Request, res: Response) => {
  const user = (req as any).user
  const msgs = await getMessagesByApplicant(user.sub)
  await markMessagesReadByApplicant(user.sub).catch(() => null)
  res.json(msgs)
})

applicantRouter.post('/me/messages', async (req: Request, res: Response) => {
  const user = (req as any).user
  const { subject, message } = req.body ?? {}
  if (!message) return res.status(400).json({ error: 'message is required.' })
  const applicant = await getApplicant(user.sub)
  const msg = await addMessage({
    applicant_id: user.sub, sender: applicant?.full_name ?? user.name,
    sender_role: 'applicant', subject, message,
  })
  res.status(201).json(msg)
})

// Notifications
applicantRouter.get('/me/notifications', async (req: Request, res: Response) => {
  const user = (req as any).user
  res.json(await getNotificationsByApplicant(user.sub))
})

applicantRouter.post('/me/notifications/read-all', async (req: Request, res: Response) => {
  const user = (req as any).user
  await markAllNotificationsRead(user.sub)
  res.json({ ok: true })
})

applicantRouter.post('/me/notifications/:id/read', async (req: Request, res: Response) => {
  await markNotificationRead(req.params.id)
  res.json({ ok: true })
})
