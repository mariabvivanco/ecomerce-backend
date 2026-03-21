import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { createHandler, captureHandler, listHandler, detailHandler } from '../controllers/order.controller'

export const orderRouter = Router()

orderRouter.post('/', createHandler)
orderRouter.post('/:id/capture', captureHandler)
orderRouter.get('/', authMiddleware, listHandler)
orderRouter.get('/:id', detailHandler)
