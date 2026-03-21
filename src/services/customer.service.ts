import { prisma } from '../lib/prisma'
import type { UpdateProfilePayload } from '../types/customer.types'

const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  createdAt: true,
  billingAddress: true,
} as const

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: USER_SELECT,
  })
  if (!user) throw new Error('NOT_FOUND')
  return user
}

export async function updateProfile(userId: string, payload: UpdateProfilePayload) {
  const { billing, ...profileFields } = payload

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...profileFields,
      ...(billing && {
        billingAddress: {
          upsert: {
            create: billing,
            update: billing,
          },
        },
      }),
    },
    select: USER_SELECT,
  })
}
