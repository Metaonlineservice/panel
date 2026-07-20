import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { config } from './config.js'
import { authRouter } from './routes/auth.js'
import { applicantRouter } from './routes/applicant.js'
import { publicRouter } from './routes/public.js'
import { adminRouter } from './routes/admin.js'

export function createApp(): express.Express {
  const app = express()
  app.use(cors({ origin: config.clientOrigin, credentials: true }))
  app.use(express.json({ limit: '12mb' }))
  app.use(express.urlencoded({ extended: true }))
  if (config.nodeEnv !== 'test') app.use(morgan('dev'))

  app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'META ONLINE SERVICE' }))

  app.use('/api/auth', authRouter)
  app.use('/api/public', publicRouter)
  app.use('/api/applicant', applicantRouter)
  app.use('/api/admin', adminRouter)

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[error]', err)
    res.status(err.status ?? 500).json({ error: err.message ?? 'Server error' })
  })

  return app
}

if (config.nodeEnv !== 'test') {
  const app = createApp()
  app.listen(config.port, () => {
    console.log(`META ONLINE SERVICE API listening on http://localhost:${config.port}`)
  })
}
