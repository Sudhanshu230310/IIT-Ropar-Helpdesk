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

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    let tickets;

    if (user.role === 'STUDENT') {
      // Get tickets created by student
      tickets = await db.ticket.findMany({
        where: { studentId: user.id },
        orderBy: { createdAt: 'desc' },
      });
    } else if (user.role === 'ADMIN') {
      // Get all pending tickets
      tickets = await db.ticket.findMany({
        where: { status: 'Pending' },
        orderBy: { createdAt: 'desc' },
      });
    } else if (user.role === 'WORKER') {
      // Get assigned tickets
      tickets = await db.ticket.findMany({
        where: {
          workerId: user.id,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ tickets }, { status: 200 });
  } catch (error) {
    console.error('Get tickets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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

    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can create tickets' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { subject, message, location, category, priority, contactNumber } = body;

    if (!subject || !message || !location || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create ticket
    const ticket = await db.ticket.create({
      data: {
        subject,
        message,
        location,
        category,
        priority: priority || 'Moderate',
        status: 'Pending',
        studentId: user.id,
        email: user.email,
        name: user.name,
        contactNumber: contactNumber || '',
      },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
