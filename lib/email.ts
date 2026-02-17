import nodemailer from 'nodemailer'

// Email transporter configuration
let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) {
    return transporter
  }

  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  return transporter
}

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const transport = getTransporter()

    await transport.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@iitropar.ac.in',
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    console.log(`Email sent to ${options.to}`)
  } catch (error) {
    console.error('Failed to send email:', error)
    throw new Error('Failed to send email')
  }
}

export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; }
          .header { color: #1f2937; margin-bottom: 20px; }
          .footer { color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Welcome to IIT Ropar Problem Ticket System</h2>
          </div>
          
          <p>Dear ${name},</p>
          
          <p>Welcome to the IIT Ropar Problem Ticket System! Your account has been successfully created.</p>
          
          <p>You can now:</p>
          <ul>
            <li>Raise problem tickets</li>
            <li>Track ticket progress</li>
            <li>Verify completed work</li>
          </ul>
          
          <p>If you have any questions, please contact the support team.</p>
          
          <div class="footer">
            <p>Indian Institute of Technology Ropar<br>
            This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Welcome to IIT Ropar Ticket System',
    html: htmlContent,
  })
}

export async function sendWorkerNotification(
  email: string,
  workerName: string,
  ticketTitle: string
): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; }
          .header { color: #1f2937; margin-bottom: 20px; }
          .ticket-box { background-color: #f3f4f6; border-left: 4px solid #0369a1; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Ticket Assignment</h2>
          </div>
          
          <p>Dear ${workerName},</p>
          
          <p>A new ticket has been assigned to you:</p>
          
          <div class="ticket-box">
            <strong>${ticketTitle}</strong>
            <p style="color: #6b7280; margin-top: 8px; font-size: 14px;">Log in to view full details and complete the task.</p>
          </div>
          
          <p>Please log in to the ticket system to view the full details and begin working on this ticket.</p>
          
          <div class="footer">
            <p>Indian Institute of Technology Ropar<br>
            This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'New Ticket Assignment - IIT Ropar',
    html: htmlContent,
  })
}

export async function sendOTPEmail(
  email: string,
  studentName: string,
  otpCode: string
): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; }
          .header { color: #1f2937; margin-bottom: 20px; }
          .otp-box { background-color: #f3f4f6; border: 2px solid #e5e7eb; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
          .otp-code { font-size: 48px; font-weight: bold; color: #0369a1; letter-spacing: 5px; }
          .footer { color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>IIT Ropar - Ticket Verification</h2>
          </div>
          
          <p>Dear ${studentName},</p>
          
          <p>Your ticket has been completed. Please use the verification code below to confirm the completion:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otpCode}</div>
            <p style="color: #6b7280; margin-top: 10px;">This code will expire in 10 minutes</p>
          </div>
          
          <p>If you did not request this verification, please contact the IIT Ropar support team immediately.</p>
          
          <div class="footer">
            <p>Indian Institute of Technology Ropar<br>
            This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Ticket Verification OTP - IIT Ropar',
    html: htmlContent,
  })
}
