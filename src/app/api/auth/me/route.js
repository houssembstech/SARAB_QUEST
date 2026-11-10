import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, role: null });
    }
    return NextResponse.json({
      authenticated: true,
      role: session.role,
      name: session.name,
      email: session.email,
      userId: session.userId,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, role: null });
  }
}
