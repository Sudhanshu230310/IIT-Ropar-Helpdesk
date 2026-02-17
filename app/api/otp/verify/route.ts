import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

async function getUserFromSession(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const session = await db.session.findUnique({
      where: { token: sessionToken },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
    });

    return user;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { otpCode, ticketId } = body;

    if (!otpCode || !ticketId) {
      return NextResponse.json(
        { error: 'OTP code and ticket ID are required' },
        { status: 400 }
      );
    }

    // Find OTP
    const otp = await db.oTP.findFirst({
      where: { 
        studentId: user.id, 
        otpCode,
        ticketId,
      },
    });

    if (!otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    if (otp.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'OTP expired' },
        { status: 400 }
      );
    }

    // Find ticket
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (ticket.studentId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    if (ticket.status !== 'Completed') {
      return NextResponse.json(
        { error: 'Ticket must be completed to verify' },
        { status: 400 }
      );
    }

    // Update ticket status to Done
    const updatedTicket = await db.ticket.update({
      where: { id: ticketId },
      data: { status: 'Done' },
    });

    // Mark OTP as used
    await db.oTP.update({
      where: { id: otp.id },
      data: { used: true, usedAt: new Date() },
    });

    return NextResponse.json(
      {
        message: 'OTP verified successfully',
        ticket: updatedTicket,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
