import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getSession, hashPassword } from '@/lib/auth';

// GET — Liste tous les utilisateurs
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }
    await connectDB();
    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('GET /admin/users error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST — Créer un nouveau compte (par l'admin)
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Nom, email et mot de passe requis' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Cet email est déjà utilisé' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'creator',
      isApproved: true, // Comptes créés par admin sont approuvés d'office
    });

    return NextResponse.json({ success: true, data: { _id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved } }, { status: 201 });
  } catch (error) {
    console.error('POST /admin/users error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT — Modifier un compte (nom, password, rôle, approbation, blocage)
export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    await connectDB();
    const { userId, name, password, isApproved, role, isBlocked } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId requis' }, { status: 400 });
    }

    const updateData = {};
    if (name !== undefined && name.trim()) updateData.name = name.trim();
    if (isApproved !== undefined) updateData.isApproved = isApproved;
    if (role) {
      if (!['admin', 'director', 'creator'].includes(role)) {
        return NextResponse.json({ success: false, error: 'Rôle invalide' }, { status: 400 });
      }
      if (userId === session.userId && role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Vous ne pouvez pas modifier votre propre rôle administrateur' }, { status: 400 });
      }
      updateData.role = role;
      // Promouvoir admin ou director approuve automatiquement si non spécifié
      if ((role === 'admin' || role === 'director') && isApproved === undefined) {
        updateData.isApproved = true;
      }
    }
    if (isBlocked !== undefined) updateData.isBlocked = isBlocked;

    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 });
      }
      updateData.password = await hashPassword(password);
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('PUT /admin/users error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE — Supprimer un compte
export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId requis' }, { status: 400 });
    }
    if (userId === session.userId) {
      return NextResponse.json({ success: false, error: 'Vous ne pouvez pas supprimer votre propre compte' }, { status: 400 });
    }

    await connectDB();
    await User.findByIdAndDelete(userId);
    return NextResponse.json({ success: true, message: 'Compte supprimé' });
  } catch (error) {
    console.error('DELETE /admin/users error:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
