import nodemailer from 'nodemailer'
import { config } from '../config.js'
import { getEmailTemplate } from './googleSheetsService.js'

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter as unknown as nodemailer.Transporter
  if (!config.smtp.host || !config.smtp.user) {
    // Stub transporter: logs instead of sending when SMTP is not configured.
    transporter = {
      sendMail: async (opts: any) => {
        console.log(`[email:stub] to=${opts.to} subject=${opts.subject}`)
        return { messageId: 'stub', response: 'stub' }
      },
    } as any
    return transporter as unknown as nodemailer.Transporter
  }
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  })
  return transporter as unknown as nodemailer.Transporter
}

export function fillTemplate(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '')
}

export async function sendTemplatedEmail(opts: {
  to: string
  templateName: string
  vars: Record<string, string>
}): Promise<void> {
  const tpl = await getEmailTemplate(opts.templateName)
  const subject = tpl ? fillTemplate(tpl.subject, opts.vars) : opts.templateName
  const html = tpl ? fillTemplate(tpl.html_body, opts.vars) : `<p>${opts.vars.note ?? ''}</p>`
  await getTransporter().sendMail({
    from: config.smtp.from, to: opts.to, subject, html,
  })
}
