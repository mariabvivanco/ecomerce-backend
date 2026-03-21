import { prisma } from '../lib/prisma'

export async function getAll() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
  })
}
