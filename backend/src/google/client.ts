import { google } from 'googleapis'
import { JWT } from 'google-auth-library'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from '../config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let authClient: JWT | null = null

function buildAuth(): JWT {
  const email = config.google.serviceAccountEmail
  const keyFile = config.google.keyFile
  const inlineKey = config.google.serviceAccountPrivateKey

  if (inlineKey) {
    return new JWT({ email, key: inlineKey, scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ] })
  }
  const resolvedKeyFile = path.resolve(__dirname, '../../../', keyFile)
  if (!fs.existsSync(resolvedKeyFile)) {
    throw new Error(
      `Google service account key not found. Set GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY or place a JSON key file at ${resolvedKeyFile}.`,
    )
  }
  const raw = JSON.parse(fs.readFileSync(resolvedKeyFile, 'utf8'))
  return new JWT({
    email: raw.client_email,
    key: raw.private_key.replace(/\\n/g, '\n'),
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  })
}

export function getAuthClient(): JWT {
  if (!authClient) authClient = buildAuth()
  return authClient
}

export const sheetsApi = google.sheets({ version: 'v4', auth: getAuthClient() })
export const driveApi = google.drive({ version: 'v3', auth: getAuthClient() })

export function resetAuthClient(): void {
  authClient = null
}
