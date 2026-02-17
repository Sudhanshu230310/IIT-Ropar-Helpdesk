import bcrypt from 'bcryptjs'
import { db } from './db'
import { randomBytes } from 'crypto'

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
  })
}

export async function createUser(data: {
  email: string
  password: string
  name: string
  role: string
  contactNumber?: string
  fieldOfWork?: string
}) {
  const hashedPassword = await hashPassword(data.password)
  return db.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  })
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
