import type { Request, Response } from 'express'
import * as categoryService from '../services/category.service'

export async function listHandler(_req: Request, res: Response): Promise<void> {
  const categories = await categoryService.getAll()
  res.json({ items: categories })
}
