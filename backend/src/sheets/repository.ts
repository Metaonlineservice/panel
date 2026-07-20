import { sheetsApi } from '../google/client.js'
import { config } from '../config.js'
import { headersFor, type SheetName } from './spec.js'

const SPREADSHEET_ID = () => config.google.spreadsheetId

function rowToObj<T = Record<string, string>>(headers: string[], row: any[]): T {
  const obj: Record<string, any> = {}
  for (let i = 0; i < headers.length; i++) {
    obj[headers[i]] = row[i] === undefined || row[i] === null ? '' : String(row[i])
  }
  return obj as T
}

function objToRow(headers: string[], obj: Record<string, any>): any[] {
  return headers.map(h => (obj[h] === undefined || obj[h] === null ? '' : String(obj[h])))
}

export async function ensureSheetExists(name: SheetName): Promise<void> {
  const meta = await sheetsApi.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID() })
  const exists = meta.data.sheets?.some(s => s.properties?.title === name)
  if (exists) return
  await sheetsApi.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID(),
    requestBody: { requests: [{ addSheet: { properties: { title: name } } }] },
  })
  await writeHeader(name)
}

export async function writeHeader(name: SheetName): Promise<void> {
  const headers = headersFor(name)
  await sheetsApi.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${name}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [headers] },
  })
}

export async function readAll<T = Record<string, string>>(name: SheetName): Promise<T[]> {
  const headers = headersFor(name)
  const res = await sheetsApi.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${name}!A1:Z`,
  })
  const rows = res.data.values ?? []
  if (rows.length === 0) return []
  // Skip header row
  const dataRows = rows.slice(1)
  return dataRows
    .filter(r => r.some(c => c !== '' && c !== undefined && c !== null))
    .map(r => rowToObj<T>(headers, r))
}

export async function appendRow<T = Record<string, string>>(
  name: SheetName,
  obj: Record<string, any>,
): Promise<T> {
  const headers = headersFor(name)
  const row = objToRow(headers, obj)
  await sheetsApi.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${name}!A1`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  })
  return rowToObj<T>(headers, row)
}

export async function findRow<T = Record<string, string>>(
  name: SheetName,
  predicate: (row: T) => boolean,
): Promise<T | null> {
  const rows = await readAll<T>(name)
  return rows.find(predicate) ?? null
}

export async function findRows<T = Record<string, string>>(
  name: SheetName,
  predicate: (row: T) => boolean,
): Promise<T[]> {
  const rows = await readAll<T>(name)
  return rows.filter(predicate)
}

/**
 * Update rows matching a predicate. `patch` is merged into each matched row.
 * Returns the number of rows updated.
 */
export async function updateRows<T extends Record<string, any> = Record<string, string>>(
  name: SheetName,
  predicate: (row: T) => boolean,
  patch: (row: T) => Record<string, any>,
): Promise<number> {
  const headers = headersFor(name)
  const res = await sheetsApi.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${name}!A1:Z`,
  })
  const rows = res.data.values ?? []
  if (rows.length === 0) return 0
  let updated = 0
  const out: any[][] = [rows[0]]
  for (let i = 1; i < rows.length; i++) {
    const obj = rowToObj<T>(headers, rows[i])
    if (predicate(obj)) {
      const p = patch(obj)
      const merged = { ...obj, ...p }
      out.push(objToRow(headers, merged))
      updated++
    } else {
      out.push(rows[i])
    }
  }
  await sheetsApi.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${name}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: out },
  })
  return updated
}

export async function deleteRows<T extends Record<string, any> = Record<string, string>>(
  name: SheetName,
  predicate: (row: T) => boolean,
): Promise<number> {
  const headers = headersFor(name)
  const res = await sheetsApi.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${name}!A1:Z`,
  })
  const rows = res.data.values ?? []
  if (rows.length === 0) return 0
  let deleted = 0
  const out: any[][] = [rows[0]]
  for (let i = 1; i < rows.length; i++) {
    const obj = rowToObj<T>(headers, rows[i])
    if (predicate(obj)) {
      deleted++
    } else {
      out.push(rows[i])
    }
  }
  await sheetsApi.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${name}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: out },
  })
  return deleted
}

export async function clearSheet(name: SheetName): Promise<void> {
  await sheetsApi.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${name}!A1:Z`,
  })
  await writeHeader(name)
}
