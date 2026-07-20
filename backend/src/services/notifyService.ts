import { addNotification } from './googleSheetsService.js'
import { sendTemplatedEmail } from './emailService.js'
import type { Applicant, VisaApplication } from './googleSheetsService.js'

export async function notifyApplicant(opts: {
  applicant: Applicant
  templateName: string
  vars: Record<string, string>
  title: string
  message: string
}): Promise<void> {
  await addNotification({
    applicant_id: opts.applicant.id,
    title: opts.title,
    message: opts.message,
    type: opts.templateName,
  }).catch(() => null)
  await sendTemplatedEmail({
    to: opts.applicant.email,
    templateName: opts.templateName,
    vars: opts.vars,
  }).catch(err => console.error('[email] send failed:', err.message))
}

export function buildAppVars(applicant: Applicant, extra: Record<string, string> = {}): Record<string, string> {
  return {
    full_name: applicant.full_name,
    email: applicant.email,
    dashboard_url: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    ...extra,
  }
}

export function buildAppApplicationVars(applicant: Applicant, app: VisaApplication, extra: Record<string, string> = {}): Record<string, string> {
  return buildAppVars(applicant, {
    application_id: app.application_id,
    visa_country: app.visa_country,
    visa_type: app.visa_type,
    status: app.status,
    ...extra,
  })
}
