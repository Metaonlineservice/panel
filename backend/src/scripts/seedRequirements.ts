import { visaRequirementsSeed } from '../data/visaRequirements.js'
import { upsertVisaRequirement } from '../services/googleSheetsService.js'
import { isConfigured } from '../config.js'

async function main() {
  if (!isConfigured()) {
    console.error('Google Sheets is not configured. Run `npm run setup` first.')
    process.exit(1)
  }
  console.log(`Seeding ${visaRequirementsSeed.length} visa requirements...`)
  let count = 0
  for (const r of visaRequirementsSeed) {
    await upsertVisaRequirement(r)
    count++
    if (count % 20 === 0) console.log(`  ${count}/${visaRequirementsSeed.length}`)
  }
  console.log(`Done. Seeded ${count} visa requirements.`)
}

main().catch(err => { console.error(err); process.exit(1) })
