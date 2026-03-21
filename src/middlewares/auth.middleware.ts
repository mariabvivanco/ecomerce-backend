import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../services/auth.service'

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token as string | undefined

  if (!token) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }

  try {
    const payload = verifyToken(token)
    res.locals.userId = payload.userId
    res.locals.email = payload.email
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
