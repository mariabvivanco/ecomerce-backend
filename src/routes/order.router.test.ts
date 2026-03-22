import { describe, it, expect, afterAll, vi } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { prisma } from '../lib/prisma'

vi.mock('../services/paypal.service', () => ({
  createPayPalOrder: vi.fn().mockResolvedValue('PAYPAL-ORDER-123'),
  capturePayPalOrder: vi.fn().mockResolvedValue('CAPTURE-ID-456'),
}))

afterAll(() => prisma.$disconnect())

const validPayload = () => ({
  items: [{ productId: '', quantity: 1 }],
  shipping: {
    firstName: 'Ana',
    lastName: 'García',
    address: 'Calle Mayor 1',
    city: 'Madrid',
    postalCode: '28001',
  },
  billing: {
    firstName: 'Ana',
    lastName: 'García',
    nif: '12345678A',
    address: 'Calle Mayor 1',
    city: 'Madrid',
    postalCode: '28001',
    email: 'ana@example.com',
  },
})

async function getFirstProductId(): Promise<string> {
  const res = await request(app).get('/api/products')
  return res.body.items[0].id
}

async function registerAndLogin() {
  const email = `order-user-${Date.now()}@example.com`
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email, password: 'Password1!', firstName: 'Test', lastName: 'User' })
  const cookies = res.headers['set-cookie'] as unknown as string[] | undefined
  if (!cookies) throw new Error('No cookie returned from register')
  return cookies
}

describe('POST /api/orders', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/orders').send(validPayload())
    expect(res.status).toBe(401)
  })

  it('creates an order when authenticated', async () => {
    const productId = await getFirstProductId()
    const payload = validPayload()
    payload.items[0].productId = productId
    const cookies = await registerAndLogin()

    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', cookies)
      .send(payload)
    expect(res.status).toBe(201)
    expect(res.body.order.status).toBe('PENDING')
    expect(res.body.paypalOrderId).toBe('PAYPAL-ORDER-123')
  })

  it('returns 400 for missing fields', async () => {
    const cookies = await registerAndLogin()
    const res = await request(app).post('/api/orders').set('Cookie', cookies).send({ items: [] })
    expect(res.status).toBe(400)
  })

  it('returns 404 for unknown product', async () => {
    const cookies = await registerAndLogin()
    const payload = validPayload()
    payload.items[0].productId = '00000000-0000-0000-0000-000000000000'
    const res = await request(app).post('/api/orders').set('Cookie', cookies).send(payload)
    expect(res.status).toBe(404)
  })
})

describe('POST /api/orders/:id/capture', () => {
  it('captures a pending order', async () => {
    const cookies = await registerAndLogin()
    const productId = await getFirstProductId()
    const payload = validPayload()
    payload.items[0].productId = productId

    const { body: created } = await request(app).post('/api/orders').set('Cookie', cookies).send(payload)
    const orderId = created.order.id

    const res = await request(app).post(`/api/orders/${orderId}/capture`)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('PAID')
  })

  it('returns 409 when order already processed', async () => {
    const cookies = await registerAndLogin()
    const productId = await getFirstProductId()
    const payload = validPayload()
    payload.items[0].productId = productId

    const { body: created } = await request(app).post('/api/orders').set('Cookie', cookies).send(payload)
    const orderId = created.order.id

    await request(app).post(`/api/orders/${orderId}/capture`)
    const res = await request(app).post(`/api/orders/${orderId}/capture`)
    expect(res.status).toBe(409)
  })

  it('returns 404 for unknown order', async () => {
    const res = await request(app).post('/api/orders/00000000-0000-0000-0000-000000000000/capture')
    expect(res.status).toBe(404)
  })
})

describe('GET /api/orders', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/orders')
    expect(res.status).toBe(401)
  })

  it('returns user orders when authenticated', async () => {
    const cookies = await registerAndLogin()
    const res = await request(app)
      .get('/api/orders')
      .set('Cookie', cookies)
    expect(res.status).toBe(200)
    expect(res.body.items).toBeInstanceOf(Array)
  })
})

describe('GET /api/orders/:id', () => {
  it('returns order detail for authenticated owner', async () => {
    const cookies = await registerAndLogin()
    const productId = await getFirstProductId()
    const payload = validPayload()
    payload.items[0].productId = productId

    const { body: created } = await request(app)
      .post('/api/orders')
      .set('Cookie', cookies)
      .send(payload)
    const orderId = created.order.id

    const res = await request(app).get(`/api/orders/${orderId}`).set('Cookie', cookies)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(orderId)
  })

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/orders/00000000-0000-0000-0000-000000000000')
    expect(res.status).toBe(401)
  })
})
