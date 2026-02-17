import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { hashPassword } from '@/lib/auth';

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

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const workers = await db.user.findMany({
      where: { role: 'WORKER' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        fieldOfWork: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ workers }, { status: 200 });
  } catch (error) {
    console.error('Get workers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
    const { email, password, name, fieldOfWork } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if worker already exists
    const existingWorker = await db.user.findUnique({
      where: { email },
    });

    if (existingWorker) {
      return NextResponse.json(
        { error: 'Worker already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create worker
    const worker = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'WORKER',
        fieldOfWork: fieldOfWork || '',
      },
    });

    return NextResponse.json(
      {
        message: 'Worker created successfully',
        worker: {
          id: worker.id,
          email: worker.email,
          name: worker.name,
          role: worker.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create worker error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
