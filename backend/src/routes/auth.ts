import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import {
  getApplicantByEmail, createApplicant, getApplicant,
} from '../services/googleSheetsService.js'
import { signToken } from '../auth/jwt.js'
import { notifyApplicant, buildAppVars } from '../services/notifyService.js'
import { config } from '../config.js'
import type { Request, Response } from 'express'

export const authRouter = Router()

const signupSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  country: z.string().optional(),
  nationality: z.string().optional(),
  date_of_birth: z.string().optional(),
})

authRouter.post('/signup', async (req: Request, res: Response) => {
  const parsed = signupSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const { full_name, email, password, ...rest } = parsed.data

  const existing = await getApplicantByEmail(email)
  if (existing) return res.status(409).json({ error: 'An account with this email already exists.' })

  const password_hash = await bcrypt.hash(password, 10)
  const applicant = await createApplicant({
    full_name, email, password_hash,
    phone: rest.phone ?? '', country: rest.country ?? '',
    nationality: rest.nationality ?? '', date_of_birth: rest.date_of_birth ?? '',
    passport_number: '',
  })

  await notifyApplicant({
    applicant,
    templateName: 'welcome',
    vars: buildAppVars(applicant),
    title: 'Welcome to META ONLINE SERVICE',
    message: 'Your account is ready. Start a visa application from your dashboard.',
  })

  const token = signToken({ sub: applicant.id, email: applicant.email, role: 'applicant', name: applicant.full_name })
  res.status(201).json({ token, user: publicApplicant(applicant) })
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

authRouter.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid credentials.' })
  const { email, password } = parsed.data

  const applicant = await getApplicantByEmail(email)
  if (!applicant) return res.status(401).json({ error: 'Invalid email or password.' })
  if (applicant.status !== 'active') return res.status(403).json({ error: 'Account is not active.' })

  const ok = await bcrypt.compare(password, applicant.password_hash)
  if (!ok) return res.status(401).json({ error: 'Invalid email or password.' })

  const token = signToken({ sub: applicant.id, email: applicant.email, role: applicant.role as any, name: applicant.full_name })
  res.json({ token, user: publicApplicant(applicant) })
})

authRouter.post('/bootstrap-admin', async (req: Request, res: Response) => {
  const { secret, email, fullName } = req.body ?? {}
  if (secret !== config.bootstrapAdminSecret) return res.status(403).json({ error: 'Invalid bootstrap secret.' })
  const applicant = await getApplicantByEmail(email)
  if (!applicant) return res.status(404).json({ error: 'User not found. Sign up first, then bootstrap.' })
  const updated = await import('../services/googleSheetsService.js').then(m => m.updateApplicant(applicant.id, { role: 'admin', full_name: fullName ?? applicant.full_name }))
  res.json({ ok: true, user: updated ? publicApplicant(updated) : null })
})

export function publicApplicant(a: any) {
  const { password_hash, ...rest } = a
  return rest
}
