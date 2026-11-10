import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyPassword, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return NextResponse.json({ success: false, error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    if (user.isBlocked) {
      return NextResponse.json({
        success: false,
        error: 'Votre compte a été bloqué par un administrateur. Contactez-nous par WhatsApp : +216 23468877',
      }, { status: 403 });
    }

    if (!user.isApproved) {
      return NextResponse.json({
        success: false,
        error: 'Votre compte est en attente d\'approbation par un administrateur. En cas de retard, contactez-nous par WhatsApp : +216 23468877',
        pendingApproval: true,
      }, { status: 403 });
    }

    await setAuthCookie({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
