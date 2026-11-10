import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PhygitalGame from '@/models/PhygitalGame';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await connectDB();
        
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
        }

        let query = {};
        // Creators only see their own games
        if (session.role === 'creator') {
            query.createdBy = session.userId;
        }

        const games = await PhygitalGame.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        return NextResponse.json({ success: true, count: games.length, data: games });
    } catch (error) {
        console.error('Error fetching phygital games:', error);
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        
        const session = await getSession();
        if (!session || (session.role !== 'admin' && session.role !== 'creator')) {
            return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
        }

        const body = await request.json();
        
        const game = await PhygitalGame.create({
            name: body.name,
            description: body.description,
            location: body.location,
            startTime: body.startTime,
            status: body.status || 'draft',
            mapTexture: body.mapTexture || 'map_general',
            isEliminationEnabled: body.isEliminationEnabled || false,
            eliminationVotesReq: body.eliminationVotesReq || 3,
            eliminationRescuesReq: body.eliminationRescuesReq || 2,
            createdBy: session.userId,
        });
        
        return NextResponse.json({ success: true, data: game }, { status: 201 });
    } catch (error) {
        console.error('Error creating phygital game:', error);
        return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
    }
}
