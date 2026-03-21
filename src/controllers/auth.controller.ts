import type { Request, Response } from 'express'
import { RegisterSchema, LoginSchema } from '../types/auth.types'
import * as authService from '../services/auth.service'

const COOKIE_NAME = 'token'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

export async function registerHandler(req: Request, res: Response): Promise<void> {
  const parsed = RegisterSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues })
    return
  }
  try {
    const { user, token } = await authService.register(parsed.data)
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
    res.status(201).json({ user })
  } catch (err) {
    if (err instanceof Error && err.message === 'EMAIL_TAKEN') {
      res.status(409).json({ error: 'Email already in use' })
      return
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const parsed = LoginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues })
    return
  }
  try {
    const { user, token } = await authService.login(parsed.data)
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
    res.json({ user })
  } catch (err) {
    if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}

export function logoutHandler(_req: Request, res: Response): void {
  res.clearCookie(COOKIE_NAME)
  res.json({ message: 'Logged out' })
}
