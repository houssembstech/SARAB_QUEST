import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PhygitalGame from '@/models/PhygitalGame';

export const dynamic = 'force-dynamic';

/**
 * GET /api/games/sarab-quest/player/open-games
 * Returns public list of games that are open for registration (status='ready') or active
 */
export async function GET() {
    try {
        await connectDB();
        const games = await PhygitalGame.find({
            status: { $in: ['ready', 'active'] }
        }).select('name description status startTime mapTexture maxTeams maxMembersPerTeam').sort({ startTime: 1 }).lean();

        return NextResponse.json({ success: true, data: games });
    } catch (error) {
        console.error('Open games error:', error);
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
    }
}
