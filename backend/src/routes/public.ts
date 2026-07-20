import { Router } from 'express'
import { getVisaRequirements, getVisaRequirementsForCountry } from '../services/googleSheetsService.js'
import type { Request, Response } from 'express'

export const publicRouter = Router()

publicRouter.get('/visa-requirements', async (_req: Request, res: Response) => {
  res.json(await getVisaRequirements())
})

publicRouter.get('/visa-requirements/:country', async (req: Request, res: Response) => {
  const rows = await getVisaRequirementsForCountry(decodeURIComponent(req.params.country))
  res.json(rows)
})

publicRouter.get('/countries', async (_req: Request, res: Response) => {
  const rows = await getVisaRequirements()
  const map = new Map<string, string>()
  for (const r of rows) map.set(r.country, r.country)
  res.json(Array.from(map.keys()).sort().map(c => ({ country: c })))
})
