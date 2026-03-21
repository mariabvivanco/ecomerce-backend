import { describe, it, expect, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { prisma } from '../lib/prisma'

afterAll(() => prisma.$disconnect())

async function registerUser(suffix: string) {
  const email = `customer-${suffix}-${Date.now()}@example.com`
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email, password: 'Password1!', firstName: 'Ana', lastName: 'García' })
  const cookies = res.headers['set-cookie'] as unknown as string[]
  return { cookies, email }
}

describe('GET /api/customers/me', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/customers/me')
    expect(res.status).toBe(401)
  })

  it('returns profile for authenticated user', async () => {
    const { cookies, email } = await registerUser('get')
    const res = await request(app).get('/api/customers/me').set('Cookie', cookies)
    expect(res.status).toBe(200)
    expect(res.body.email).toBe(email)
    expect(res.body.firstName).toBe('Ana')
    expect(res.body.password).toBeUndefined()
  })
})

describe('PUT /api/customers/me', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).put('/api/customers/me').send({ firstName: 'Nueva' })
    expect(res.status).toBe(401)
  })

  it('updates first name', async () => {
    const { cookies } = await registerUser('update-name')
    const res = await request(app)
      .put('/api/customers/me')
      .set('Cookie', cookies)
      .send({ firstName: 'Beatriz' })
    expect(res.status).toBe(200)
    expect(res.body.firstName).toBe('Beatriz')
  })

  it('creates billing address', async () => {
    const { cookies } = await registerUser('billing')
    const billing = {
      firstName: 'Ana',
      lastName: 'García',
      nif: '12345678A',
      address: 'Calle Mayor 1',
      city: 'Madrid',
      postalCode: '28001',
    }
    const res = await request(app)
      .put('/api/customers/me')
      .set('Cookie', cookies)
      .send({ billing })
    expect(res.status).toBe(200)
    expect(res.body.billingAddress.nif).toBe('12345678A')
  })

  it('updates existing billing address', async () => {
    const { cookies } = await registerUser('billing-update')
    const billing = {
      firstName: 'Ana',
      lastName: 'García',
      nif: '12345678A',
      address: 'Calle Mayor 1',
      city: 'Madrid',
      postalCode: '28001',
    }
    await request(app).put('/api/customers/me').set('Cookie', cookies).send({ billing })
    const res = await request(app)
      .put('/api/customers/me')
      .set('Cookie', cookies)
      .send({ billing: { ...billing, city: 'Barcelona' } })
    expect(res.status).toBe(200)
    expect(res.body.billingAddress.city).toBe('Barcelona')
  })

  it('returns 400 for invalid payload', async () => {
    const { cookies } = await registerUser('invalid')
    const res = await request(app)
      .put('/api/customers/me')
      .set('Cookie', cookies)
      .send({ firstName: '' })
    expect(res.status).toBe(400)
  })
})
