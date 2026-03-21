import { Router } from 'express'
import { listHandler, featuredHandler, detailHandler } from '../controllers/product.controller'

export const productRouter = Router()

productRouter.get('/', listHandler)
productRouter.get('/featured', featuredHandler)
productRouter.get('/:id', detailHandler)
