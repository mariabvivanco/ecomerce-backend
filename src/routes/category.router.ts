import { Router } from 'express'
import { listHandler } from '../controllers/category.controller'

export const categoryRouter = Router()

categoryRouter.get('/', listHandler)
