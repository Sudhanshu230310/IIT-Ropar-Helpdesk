import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { sendWorkerNotification } from '@/lib/email';

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

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { ticketId, workerId } = body;

    if (!ticketId || !workerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify ticket exists
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (ticket.status !== 'Pending') {
      return NextResponse.json(
        { error: 'Ticket must be pending to assign' },
        { status: 400 }
      );
    }

    // Verify worker exists
    const worker = await db.user.findUnique({
      where: { id: workerId },
    });

    if (!worker || worker.role !== 'WORKER') {
      return NextResponse.json(
        { error: 'Invalid worker' },
        { status: 400 }
      );
    }

    // Update ticket status and assign worker
    const updatedTicket = await db.ticket.update({
      where: { id: ticketId },
      data: { 
        status: 'Assigned',
        workerId,
        adminId: user.id,
      },
    });

    // Send notification to worker
    await sendWorkerNotification(worker.email, worker.name, ticket.subject);

    return NextResponse.json(
      {
        message: 'Ticket assigned successfully',
        ticket: updatedTicket,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Assign ticket error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
