import type { Request, Response } from 'express'
import { ProductFiltersSchema } from '../types/product.types'
import * as productService from '../services/product.service'

export async function listHandler(req: Request, res: Response): Promise<void> {
  const parsed = ProductFiltersSchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues })
    return
  }
  const result = await productService.getAll(parsed.data)
  res.json(result)
}

export async function featuredHandler(_req: Request, res: Response): Promise<void> {
  const items = await productService.getFeatured()
  res.json({ items })
}

export async function detailHandler(req: Request, res: Response): Promise<void> {
  try {
    const product = await productService.getById(String(req.params.id))
    res.json(product)
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'Product not found' })
      return
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}
