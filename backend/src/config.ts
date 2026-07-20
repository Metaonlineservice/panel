import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../.env') })

function required(key: string, fallback = ''): string {
  const v = process.env[key] ?? fallback
  return v
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  jwtSecret: required('JWT_SECRET', 'dev-insecure-jwt-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  bootstrapAdminSecret: process.env.BOOTSTRAP_ADMIN_SECRET ?? 'meta-bootstrap-2026',
  google: {
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '',
    serviceAccountPrivateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
      ? process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n')
      : '',
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE ?? 'google-credentials.json',
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? '',
    driveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID ?? '',
  },
  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.SMTP_FROM ?? 'META ONLINE SERVICE <no-reply@metaonlineservice.com>',
  },
}

export function isConfigured(): boolean {
  return Boolean(
    config.google.serviceAccountEmail &&
    (config.google.serviceAccountPrivateKey || config.google.keyFile) &&
    config.google.spreadsheetId,
  )
}
