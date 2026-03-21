import { prisma } from '../lib/prisma'
import type { ProductFilters } from '../types/product.types'

const PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  stock: true,
  imageUrl: true,
  featured: true,
  requiresPrescription: true,
  category: { select: { id: true, name: true, slug: true } },
} as const

export async function getAll(filters: ProductFilters) {
  const { category, search, minPrice, maxPrice, page, limit } = filters
  const skip = (page - 1) * limit

  const where = {
    ...(category && { category: { slug: category } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, select: PRODUCT_SELECT, skip, take: limit }),
    prisma.product.count({ where }),
  ])

  return { items, total, page, limit }
}

export async function getById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: PRODUCT_SELECT,
  })
  if (!product) throw new Error('NOT_FOUND')
  return product
}

export async function getFeatured() {
  return prisma.product.findMany({
    where: { featured: true },
    select: PRODUCT_SELECT,
    take: 10,
  })
}
