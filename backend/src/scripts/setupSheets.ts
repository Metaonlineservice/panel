import { SHEETS } from '../sheets/spec.js'
import { ensureSheetExists, writeHeader, clearSheet } from '../sheets/repository.js'
import { isConfigured } from '../config.js'
import { getEmailTemplates } from '../services/googleSheetsService.js'
import { nanoid } from 'nanoid'

const DEFAULT_TEMPLATES = [
  {
    name: 'welcome',
    subject: 'Welcome to META ONLINE SERVICE',
    html_body: `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;background:#f0f4fa;margin:0;padding:0"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden"><div style="background:#13213a;padding:32px;text-align:center"><h1 style="color:#e9b62a;margin:0;font-size:24px">META ONLINE SERVICE</h1><p style="color:#bcd0e6;margin:4px 0 0">Your Trusted Global Visa Processing Partner</p></div><div style="padding:32px"><h2 style="color:#13213a">Welcome aboard, {{full_name}}!</h2><p style="color:#243f6b;line-height:1.6">Your account has been created successfully. You can now submit visa applications, track their progress, upload documents, and communicate with our visa team — all from your personal dashboard.</p><a href="{{dashboard_url}}" style="display:inline-block;background:#e9b62a;color:#13213a;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;margin-top:16px">Go to Dashboard</a></div><div style="background:#f0f4fa;padding:24px;text-align:center;color:#243f6b;font-size:13px"><p>© META ONLINE SERVICE · support@metaonlineservice.com</p></div></div></body></html>`,
  },
  {
    name: 'application_received',
    subject: 'Your visa application has been received',
    html_body: `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;background:#f0f4fa;margin:0;padding:0"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden"><div style="background:#13213a;padding:32px;text-align:center"><h1 style="color:#e9b62a;margin:0">META ONLINE SERVICE</h1></div><div style="padding:32px"><h2 style="color:#13213a">Application Received</h2><p style="color:#243f6b;line-height:1.6">We have received your application <strong>{{application_id}}</strong> for a {{visa_type}} visa to {{visa_country}}. Our team will review it shortly.</p><a href="{{dashboard_url}}" style="display:inline-block;background:#e9b62a;color:#13213a;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;margin-top:16px">Track Application</a></div><div style="background:#f0f4fa;padding:24px;text-align:center;color:#243f6b;font-size:13px">© META ONLINE SERVICE</div></div></body></html>`,
  },
  {
    name: 'document_missing',
    subject: 'Missing documents for your application',
    html_body: `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;background:#f0f4fa;margin:0;padding:0"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden"><div style="background:#13213a;padding:32px;text-align:center"><h1 style="color:#e9b62a;margin:0">META ONLINE SERVICE</h1></div><div style="padding:32px"><h2 style="color:#13213a">Action Required</h2><p style="color:#243f6b;line-height:1.6">Your application <strong>{{application_id}}</strong> requires additional documents. Please upload them at your earliest convenience.</p><a href="{{dashboard_url}}" style="display:inline-block;background:#e9b62a;color:#13213a;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;margin-top:16px">Upload Documents</a></div><div style="background:#f0f4fa;padding:24px;text-align:center;color:#243f6b;font-size:13px">© META ONLINE SERVICE</div></div></body></html>`,
  },
  {
    name: 'status_update',
    subject: 'Your application status has been updated',
    html_body: `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;background:#f0f4fa;margin:0;padding:0"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden"><div style="background:#13213a;padding:32px;text-align:center"><h1 style="color:#e9b62a;margin:0">META ONLINE SERVICE</h1></div><div style="padding:32px"><h2 style="color:#13213a">Status Update</h2><p style="color:#243f6b;line-height:1.6">Your application <strong>{{application_id}}</strong> status changed from <strong>{{previous_status}}</strong> to <strong>{{new_status}}</strong>.</p><a href="{{dashboard_url}}" style="display:inline-block;background:#e9b62a;color:#13213a;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;margin-top:16px">View Application</a></div><div style="background:#f0f4fa;padding:24px;text-align:center;color:#243f6b;font-size:13px">© META ONLINE SERVICE</div></div></body></html>`,
  },
  {
    name: 'visa_approved',
    subject: 'Your visa has been approved!',
    html_body: `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;background:#f0f4fa;margin:0;padding:0"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden"><div style="background:#13213a;padding:32px;text-align:center"><h1 style="color:#e9b62a;margin:0">META ONLINE SERVICE</h1></div><div style="padding:32px;text-align:center"><h2 style="color:#13213a">Congratulations, {{full_name}}!</h2><p style="color:#243f6b;line-height:1.6">Your {{visa_type}} visa for {{visa_country}} has been approved. Application <strong>{{application_id}}</strong>.</p></div><div style="background:#f0f4fa;padding:24px;text-align:center;color:#243f6b;font-size:13px">© META ONLINE SERVICE</div></div></body></html>`,
  },
  {
    name: 'visa_rejected',
    subject: 'Update on your visa application',
    html_body: `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;background:#f0f4fa;margin:0;padding:0"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden"><div style="background:#13213a;padding:32px;text-align:center"><h1 style="color:#e9b62a;margin:0">META ONLINE SERVICE</h1></div><div style="padding:32px"><h2 style="color:#13213a">Application Update</h2><p style="color:#243f6b;line-height:1.6">We regret to inform you that your application <strong>{{application_id}}</strong> for {{visa_country}} has been rejected. {{note}}</p></div><div style="background:#f0f4fa;padding:24px;text-align:center;color:#243f6b;font-size:13px">© META ONLINE SERVICE</div></div></body></html>`,
  },
  {
    name: 'payment_received',
    subject: 'Payment confirmation',
    html_body: `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;background:#f0f4fa;margin:0;padding:0"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden"><div style="background:#13213a;padding:32px;text-align:center"><h1 style="color:#e9b62a;margin:0">META ONLINE SERVICE</h1></div><div style="padding:32px"><h2 style="color:#13213a">Payment Received</h2><p style="color:#243f6b;line-height:1.6">We have received your payment. Thank you for choosing META ONLINE SERVICE.</p></div><div style="background:#f0f4fa;padding:24px;text-align:center;color:#243f6b;font-size:13px">© META ONLINE SERVICE</div></div></body></html>`,
  },
]

async function main() {
  if (!isConfigured()) {
    console.error('Google Sheets is not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (or key file), and GOOGLE_SHEETS_SPREADSHEET_ID in backend/.env')
    process.exit(1)
  }
  console.log('Creating sheets and headers in spreadsheet...')
  for (const sheet of SHEETS) {
    await ensureSheetExists(sheet.name)
    console.log(`  ✓ ${sheet.name}`)
  }

  // Seed default email templates if empty
  const existing = await getEmailTemplates()
  if (existing.length === 0) {
    const { appendRow } = await import('../sheets/repository.js')
    for (const t of DEFAULT_TEMPLATES) {
      await appendRow('Email Templates', {
        template_id: `TPL_${nanoid(10)}`,
        name: t.name, subject: t.subject, html_body: t.html_body,
      } as any)
      console.log(`  ✓ template: ${t.name}`)
    }
  } else {
    console.log(`  • Email Templates already has ${existing.length} rows — skipping seed`)
  }

  console.log('\nSetup complete. Your "META ONLINE SERVICE DATABASE" spreadsheet is ready.')
  console.log('Next: run `npm run seed` to populate visa requirements for 150+ countries.')
}

main().catch(err => { console.error(err); process.exit(1) })
