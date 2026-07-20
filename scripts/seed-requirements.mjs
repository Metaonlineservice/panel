// One-shot seeder: reads visaRequirementsSeed from the TS source and inserts into Supabase.
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) { console.error('Missing env'); process.exit(1) }
const supabase = createClient(url, key)

const src = readFileSync('./src/data/visaRequirements.ts', 'utf8')
const start = src.indexOf('[')
const end = src.lastIndexOf(']')
const jsonish = src.slice(start, end + 1)
const seed = eval('(' + jsonish + ')')

const rows = seed.map(r => ({
  country: r.country,
  country_code: r.country_code,
  visa_type: r.visa_type,
  required_documents: r.required_documents,
  processing_time: r.processing_time,
  fees: r.fees,
  additional_requirements: r.additional_requirements,
  embassy_information: r.embassy_information,
  eligibility: r.eligibility,
  application_steps: r.application_steps,
}))

const BATCH = 100
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH)
  const { error } = await supabase.from('visa_requirements').upsert(batch, { onConflict: 'country,visa_type', ignoreDuplicates: true })
  if (error) { console.error('Insert error', i, error); process.exit(1) }
}
console.log('Seeded', rows.length, 'visa requirements')
