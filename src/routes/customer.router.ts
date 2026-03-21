import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { getMeHandler, updateMeHandler } from '../controllers/customer.controller'

export const customerRouter = Router()

customerRouter.use(authMiddleware)
customerRouter.get('/me', getMeHandler)
customerRouter.put('/me', updateMeHandler)
