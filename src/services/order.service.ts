import { prisma } from '../lib/prisma'
import { createPayPalOrder, capturePayPalOrder } from './paypal.service'
import type { CreateOrderPayload } from '../types/order.types'

const ORDER_SELECT = {
  id: true,
  email: true,
  status: true,
  total: true,
  createdAt: true,
  items: {
    select: {
      id: true,
      quantity: true,
      unitPrice: true,
      product: { select: { id: true, name: true, imageUrl: true } },
    },
  },
  shipping: true,
} as const

export async function createOrder(payload: CreateOrderPayload, userId?: string) {
  const products = await prisma.product.findMany({
    where: { id: { in: payload.items.map((i) => i.productId) } },
    select: { id: true, price: true, stock: true, name: true },
  })

  for (const item of payload.items) {
    const product = products.find((p) => p.id === item.productId)
    if (!product) throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`)
    if (product.stock < item.quantity) throw new Error(`INSUFFICIENT_STOCK:${product.name}`)
  }

  const total = payload.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!
    return sum + product.price * item.quantity
  }, 0)

  const paypalOrderId = await createPayPalOrder(total)

  const order = await prisma.order.create({
    data: {
      email: payload.billing.email,
      total,
      paypalOrderId,
      ...(userId && { userId }),
      items: {
        create: payload.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: products.find((p) => p.id === item.productId)!.price,
        })),
      },
      shipping: { create: payload.shipping },
    },
    select: ORDER_SELECT,
  })

  return { order, paypalOrderId }
}

export async function captureOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new Error('NOT_FOUND')
  if (!order.paypalOrderId) throw new Error('NO_PAYPAL_ORDER')
  if (order.status !== 'PENDING') throw new Error('ALREADY_PROCESSED')

  const captureId = await capturePayPalOrder(order.paypalOrderId)

  return prisma.order.update({
    where: { id: orderId },
    data: { status: 'PAID', paypalPaymentId: captureId },
    select: ORDER_SELECT,
  })
}

export async function listByUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    select: ORDER_SELECT,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getById(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { ...ORDER_SELECT, userId: true },
  })
  if (!order) throw new Error('NOT_FOUND')
  if (order.userId !== userId) throw new Error('FORBIDDEN')
  const { userId: _, ...safeOrder } = order
  return safeOrder
}
