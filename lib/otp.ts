import { db } from './db'

const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 10

export function generateOTP(): string {
  // Generate a 6-digit OTP
  const otp = Math.floor(Math.random() * 1000000)
  return otp.toString().padStart(OTP_LENGTH, '0')
}

export async function createOTP(
  ticketId: string,
  studentId: string
): Promise<string> {
  // Delete any existing unused OTPs for this ticket
  await db.oTP.deleteMany({
    where: {
      ticketId,
      used: false,
    },
  })

  const otpCode = generateOTP()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  await db.oTP.create({
    data: {
      otpCode,
      expiresAt,
      ticketId,
      studentId,
    },
  })

  return otpCode
}

export async function verifyOTP(
  ticketId: string,
  studentId: string,
  otpCode: string
): Promise<boolean> {
  const otp = await db.oTP.findFirst({
    where: {
      ticketId,
      studentId,
      otpCode,
      used: false,
    },
  })

  if (!otp) {
    return false
  }

  // Check if OTP has expired
  if (new Date() > otp.expiresAt) {
    return false
  }

  // Mark OTP as used
  await db.oTP.update({
    where: { id: otp.id },
    data: {
      used: true,
      usedAt: new Date(),
    },
  })

  return true
}

export async function getLatestOTP(ticketId: string) {
  return db.oTP.findFirst({
    where: { ticketId },
    orderBy: { createdAt: 'desc' },
  })
}
