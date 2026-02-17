export type UserRole = 'student' | 'admin' | 'worker'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  contactNumber?: string
  fieldOfWork?: string
  createdAt: Date
  updatedAt: Date
}

export interface Ticket {
  id: string
  studentId: string
  workerId?: string
  adminId?: string
  status: TicketStatus
  category: string
  name: string
  email: string
  priority: TicketPriority
  location: string
  contactNumber: string
  subject: string
  message: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export type TicketStatus =
  | 'Pending'
  | 'Assigned'
  | 'Completed'
  | 'VerificationPending'
  | 'Done'

export type TicketPriority = 'Low' | 'Moderate' | 'High'

export interface Assignment {
  id: string
  ticketId: string
  workerId: string
  status: AssignmentStatus
  assignedAt: Date
  completedAt?: Date
}

export type AssignmentStatus = 'Assigned' | 'InProgress' | 'Completed'

export interface OTP {
  id: string
  ticketId: string
  studentId: string
  otpCode: string
  expiresAt: Date
  used: boolean
  usedAt?: Date
}

export interface Category {
  id: string
  name: string
  type: 'WorksAndEstate' | 'ITHelpdesk'
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  name: string
  contactNumber: string
}

export interface RaiseTicketRequest {
  category: string
  priority: TicketPriority
  location: string
  subject: string
  message: string
}

export interface AssignTicketRequest {
  workerId: string
  ticketId: string
}

export interface VerifyOTPRequest {
  ticketId: string
  otpCode: string
}
