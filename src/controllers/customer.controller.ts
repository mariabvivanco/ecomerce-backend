import type { Request, Response } from 'express'
import { UpdateProfileSchema } from '../types/customer.types'
import * as customerService from '../services/customer.service'

export async function getMeHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = res.locals.userId as string
    const profile = await customerService.getProfile(userId)
    res.json(profile)
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'User not found' })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

export async function updateMeHandler(req: Request, res: Response): Promise<void> {
  const parsed = UpdateProfileSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues })
    return
  }
  try {
    const userId = res.locals.userId as string
    const profile = await customerService.updateProfile(userId, parsed.data)
    res.json(profile)
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
}
