import { describe, it, expect, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../app'
import { prisma } from '../lib/prisma'

afterAll(() => prisma.$disconnect())

describe('GET /api/products', () => {
  it('returns paginated product list', async () => {
    const res = await request(app).get('/api/products')
    expect(res.status).toBe(200)
    expect(res.body.items).toBeInstanceOf(Array)
    expect(res.body.total).toBeGreaterThan(0)
    expect(res.body.page).toBe(1)
  })

  it('filters by category slug', async () => {
    const res = await request(app).get('/api/products?category=medicamentos')
    expect(res.status).toBe(200)
    expect(res.body.items.every((p: { category: { slug: string } }) =>
      p.category.slug === 'medicamentos'
    )).toBe(true)
  })

  it('filters by search term', async () => {
    const res = await request(app).get('/api/products?search=paracetamol')
    expect(res.status).toBe(200)
    expect(res.body.items.length).toBeGreaterThan(0)
  })

  it('filters by price range', async () => {
    const res = await request(app).get('/api/products?minPrice=5&maxPrice=10')
    expect(res.status).toBe(200)
    expect(res.body.items.every((p: { price: number }) =>
      p.price >= 5 && p.price <= 10
    )).toBe(true)
  })

  it('returns 400 for invalid query params', async () => {
    const res = await request(app).get('/api/products?limit=999')
    expect(res.status).toBe(400)
  })
})

describe('GET /api/products/featured', () => {
  it('returns featured products', async () => {
    const res = await request(app).get('/api/products/featured')
    expect(res.status).toBe(200)
    expect(res.body.items).toBeInstanceOf(Array)
    expect(res.body.items.length).toBeGreaterThan(0)
  })
})

describe('GET /api/products/:id', () => {
  it('returns a product by id', async () => {
    const { items } = (await request(app).get('/api/products')).body
    const res = await request(app).get(`/api/products/${items[0].id}`)
    expect(res.status).toBe(200)
    expect(res.body.id).toBe(items[0].id)
  })

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/products/00000000-0000-0000-0000-000000000000')
    expect(res.status).toBe(404)
  })
})

describe('GET /api/categories', () => {
  it('returns all categories', async () => {
    const res = await request(app).get('/api/categories')
    expect(res.status).toBe(200)
    expect(res.body.items.length).toBe(5)
  })
})
