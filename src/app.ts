import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { healthRouter } from './routes/health.router'
import { authRouter } from './routes/auth.router'
import { productRouter } from './routes/product.router'
import { categoryRouter } from './routes/category.router'
import { orderRouter } from './routes/order.router'
import { customerRouter } from './routes/customer.router'

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/products', productRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/orders', orderRouter)
app.use('/api/customers', customerRouter)

export { app }
