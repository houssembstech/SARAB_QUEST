import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PhygitalTeam from '@/models/PhygitalTeam';
import PhygitalGame from '@/models/PhygitalGame';
import crypto from 'crypto';

/**
 * GET /api/games/sarab-quest/player/lobby?gameId=...
 * Returns public info about a game in 'ready' status (lobby info + existing teams count)
 */
export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const gameId = searchParams.get('gameId');

        if (!gameId) {
            return NextResponse.json({ success: false, error: 'gameId requis' }, { status: 400 });
        }

        const game = await PhygitalGame.findById(gameId).select('-stages');
        if (!game) {
            return NextResponse.json({ success: false, error: 'Mission introuvable' }, { status: 404 });
        }

        const teamsCount = await PhygitalTeam.countDocuments({ gameId });
        const teams = await PhygitalTeam.find({ gameId }).select('teamName membersCount createdAt').lean();

        return NextResponse.json({
            success: true,
            data: {
                gameId: game._id,
                gameName: game.name,
                gameDescription: game.description,
                status: game.status,
                startTime: game.startTime,
                mapTexture: game.mapTexture,
                maxTeams: game.maxTeams || 0,
                maxMembersPerTeam: game.maxMembersPerTeam || 10,
                teamsCount,
                teams: teams.map(t => ({ teamName: t.teamName, membersCount: t.membersCount })),
            }
        });
    } catch (error) {
        console.error('Lobby GET error:', error);
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
    }
}

/**
 * POST /api/games/sarab-quest/player/lobby
 * Public endpoint: a team leader self-registers their team
 * Body: { gameId, teamName, membersCount }
 * Returns: { teamId, teamName, accessCodes: ['ABC123', ...] }
 */
export async function POST(request) {
    try {
        await connectDB();
        const { gameId, teamName, membersCount = 1 } = await request.json();

        if (!gameId || !teamName) {
            return NextResponse.json({ success: false, error: 'gameId et teamName requis' }, { status: 400 });
        }

        const trimmedName = teamName.trim();
        if (trimmedName.length < 2 || trimmedName.length > 30) {
            return NextResponse.json({ success: false, error: 'Le nom d\'équipe doit avoir entre 2 et 30 caractères' }, { status: 400 });
        }

        const count = parseInt(membersCount);
        if (isNaN(count) || count < 1 || count > 20) {
            return NextResponse.json({ success: false, error: 'Nombre de membres invalide (1-20)' }, { status: 400 });
        }

        const game = await PhygitalGame.findById(gameId);
        if (!game) {
            return NextResponse.json({ success: false, error: 'Mission introuvable' }, { status: 404 });
        }

        // Only allow registration when game is in 'ready' state
        if (game.status !== 'ready') {
            return NextResponse.json({
                success: false,
                error: game.status === 'active' ? 'La mission a déjà commencé !' :
                       game.status === 'completed' ? 'La mission est terminée.' :
                       'La mission n\'est pas encore ouverte aux inscriptions.'
            }, { status: 400 });
        }

        // Check max teams limit
        if (game.maxTeams && game.maxTeams > 0) {
            const existingCount = await PhygitalTeam.countDocuments({ gameId });
            if (existingCount >= game.maxTeams) {
                return NextResponse.json({ success: false, error: `Nombre maximum d'équipes atteint (${game.maxTeams})` }, { status: 400 });
            }
        }

        // Check max members per team
        const maxMembers = game.maxMembersPerTeam || 10;
        if (count > maxMembers) {
            return NextResponse.json({ success: false, error: `Maximum ${maxMembers} membres par équipe` }, { status: 400 });
        }

        // Check team name not already taken in this game
        const existing = await PhygitalTeam.findOne({ gameId, teamName: trimmedName });
        if (existing) {
            return NextResponse.json({ success: false, error: 'Ce nom d\'équipe est déjà pris pour cette mission.' }, { status: 400 });
        }

        // Generate unique access codes for all members
        const existingCodes = (await PhygitalTeam.find({ gameId }).select('accessCodes').lean())
            .flatMap(t => t.accessCodes);

        const accessCodes = [];
        for (let i = 0; i < count; i++) {
            let code;
            do {
                code = crypto.randomBytes(3).toString('hex').toUpperCase();
            } while (accessCodes.includes(code) || existingCodes.includes(code));
            accessCodes.push(code);
        }

        const team = await PhygitalTeam.create({
            gameId,
            teamName: trimmedName,
            membersCount: count,
            accessCodes,
            currentStageIndex: 0,
            score: 0,
        });

        return NextResponse.json({
            success: true,
            data: {
                teamId: team._id,
                teamName: team.teamName,
                membersCount: count,
                accessCodes,
                gameId,
                gameName: game.name,
                startTime: game.startTime,
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Lobby POST error:', error);
        if (error.code === 11000) {
            return NextResponse.json({ success: false, error: 'Ce nom d\'équipe est déjà pris.' }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
    }
}
