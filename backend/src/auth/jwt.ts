import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import type { Request, Response, NextFunction } from 'express'

export interface JwtPayload {
  sub: string
  email: string
  role: 'applicant' | 'admin' | 'agent'
  name: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn as any })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }
  try {
    const payload = verifyToken(token)
    ;(req as any).user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function requireRole(...roles: Array<'applicant' | 'admin' | 'agent'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as JwtPayload | undefined
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: 'Forbidden — insufficient role' })
      return
    }
    next()
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (token) {
    try {
      ;(req as any).user = verifyToken(token)
    } catch { /* ignore */ }
  }
  next()
}
