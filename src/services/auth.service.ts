import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import type { RegisterPayload, LoginPayload, JwtPayload } from '../types/auth.types'

const SALT_ROUNDS = 10
const JWT_EXPIRY = '7d'

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: JWT_EXPIRY })
}

export async function register(data: RegisterPayload) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw new Error('EMAIL_TAKEN')

  const hashed = await bcrypt.hash(data.password, SALT_ROUNDS)
  const user = await prisma.user.create({
    data: { ...data, password: hashed },
    select: { id: true, email: true, firstName: true, lastName: true },
  })

  const token = signToken({ userId: user.id, email: user.email })
  return { user, token }
}

export async function login(data: LoginPayload) {
  const user = await prisma.user.findUnique({ where: { email: data.email } })
  if (!user) throw new Error('INVALID_CREDENTIALS')

  const valid = await bcrypt.compare(data.password, user.password)
  if (!valid) throw new Error('INVALID_CREDENTIALS')

  const token = signToken({ userId: user.id, email: user.email })
  const { password: _, ...safeUser } = user
  return { user: safeUser, token }
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
}
