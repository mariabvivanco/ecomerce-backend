import { describe, it, expect, afterAll, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { prisma } from '../lib/prisma'

const TEST_USER = {
  email: 'test-auth@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User',
}

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_USER.email } })
})

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_USER.email } })
  await prisma.$disconnect()
})

describe('POST /api/auth/register', () => {
  it('creates a user and returns httpOnly cookie', async () => {
    const res = await request(app).post('/api/auth/register').send(TEST_USER)
    expect(res.status).toBe(201)
    expect(res.body.user.email).toBe(TEST_USER.email)
    expect(res.body.user.password).toBeUndefined()
    expect(res.headers['set-cookie']).toBeDefined()
  })

  it('returns 409 when email is already taken', async () => {
    const res = await request(app).post('/api/auth/register').send(TEST_USER)
    expect(res.status).toBe(409)
  })

  it('returns 400 for invalid payload', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'bad' })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('returns user and sets cookie on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe(TEST_USER.email)
    expect(res.headers['set-cookie']).toBeDefined()
  })

  it('returns 401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: 'wrongpass' })
    expect(res.status).toBe(401)
  })

  it('returns 401 on unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'test' })
    expect(res.status).toBe(401)
  })
})

describe('POST /api/auth/logout', () => {
  it('clears the cookie and returns message', async () => {
    const res = await request(app).post('/api/auth/logout')
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Logged out')
  })
})
