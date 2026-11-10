import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PhygitalGame from '@/models/PhygitalGame';
import PhygitalStage from '@/models/PhygitalStage';
import PhygitalTeam from '@/models/PhygitalTeam';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function checkOwnership(gameId, session) {
    if (session.role === 'admin') return true;
    const game = await PhygitalGame.findById(gameId);
    if (!game) return false;
    return game.createdBy && game.createdBy.toString() === session.userId;
}

export async function GET(request, { params }) {
    try {
        await connectDB();
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
        }

        const { id } = await params;
        
        if (!(await checkOwnership(id, session))) {
            return NextResponse.json({ success: false, error: 'Accès non autorisé à cette mission' }, { status: 403 });
        }

        const game = await PhygitalGame.findById(id).populate({
            path: 'stages',
            select: '+correctAnswer'
        });
        if (!game) {
            return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: game });
    } catch (error) {
        console.error('Error fetching game:', error);
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        await connectDB();
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
        }

        const { id } = await params;
        
        if (!(await checkOwnership(id, session))) {
            return NextResponse.json({ success: false, error: 'Vous ne pouvez modifier que vos propres missions' }, { status: 403 });
        }

        const body = await request.json();
        
        const game = await PhygitalGame.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        }).populate('stages');
        
        if (!game) {
            return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: game });
    } catch (error) {
        console.error('Error updating game:', error);
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
        }

        const { id } = await params;
        
        if (!(await checkOwnership(id, session))) {
            return NextResponse.json({ success: false, error: 'Vous ne pouvez supprimer que vos propres missions' }, { status: 403 });
        }

        const game = await PhygitalGame.findById(id);
        if (!game) {
            return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 });
        }
        
        await PhygitalStage.deleteMany({ gameId: id });
        await PhygitalTeam.deleteMany({ gameId: id });
        await game.deleteOne();
        
        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        console.error('Error deleting game:', error);
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}
