import { describe, it, expect, afterAll } from 'vitest'
import { prisma } from './prisma'

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Prisma client', () => {
  it('connects to the database', async () => {
    const result = await prisma.$queryRaw<[{ result: number }]>`SELECT 1 AS result`
    expect(result[0].result).toBe(1)
  })

  it('can create and delete a category', async () => {
    const category = await prisma.category.create({
      data: { name: 'Test Category', slug: 'test-category' },
    })

    expect(category.id).toBeDefined()
    expect(category.name).toBe('Test Category')

    await prisma.category.delete({ where: { id: category.id } })
  })

  it('can create and delete a product', async () => {
    const category = await prisma.category.create({
      data: { name: 'Test Cat 2', slug: 'test-cat-2' },
    })

    const product = await prisma.product.create({
      data: {
        name: 'Paracetamol 500mg',
        slug: 'paracetamol-500mg',
        description: 'Pain reliever',
        price: 3.5,
        stock: 100,
        categoryId: category.id,
      },
    })

    expect(product.slug).toBe('paracetamol-500mg')
    expect(product.requiresPrescription).toBe(false)

    await prisma.product.delete({ where: { id: product.id } })
    await prisma.category.delete({ where: { id: category.id } })
  })
})
