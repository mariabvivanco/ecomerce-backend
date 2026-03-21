import type { Request, Response } from 'express'
import { CreateOrderSchema } from '../types/order.types'
import * as orderService from '../services/order.service'

export async function createHandler(req: Request, res: Response): Promise<void> {
  const parsed = CreateOrderSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues })
    return
  }
  try {
    const userId = res.locals.userId as string | undefined
    const result = await orderService.createOrder(parsed.data, userId)
    res.status(201).json(result)
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('PRODUCT_NOT_FOUND')) {
      res.status(404).json({ error: err.message })
    } else if (err instanceof Error && err.message.startsWith('INSUFFICIENT_STOCK')) {
      res.status(409).json({ error: err.message })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

export async function captureHandler(req: Request, res: Response): Promise<void> {
  try {
    const order = await orderService.captureOrder(String(req.params.id))
    res.json(order)
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'Order not found' })
    } else if (err instanceof Error && err.message === 'ALREADY_PROCESSED') {
      res.status(409).json({ error: 'Order already processed' })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

export async function listHandler(req: Request, res: Response): Promise<void> {
  const userId = res.locals.userId as string
  const orders = await orderService.listByUser(userId)
  res.json({ items: orders })
}

export async function detailHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = res.locals.userId as string | undefined
    const order = await orderService.getById(String(req.params.id), userId)
    res.json(order)
  } catch (err) {
    if (err instanceof Error && err.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'Order not found' })
    } else if (err instanceof Error && err.message === 'FORBIDDEN') {
      res.status(403).json({ error: 'Forbidden' })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
