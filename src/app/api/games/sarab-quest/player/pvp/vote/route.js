import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PhygitalTeam from '@/models/PhygitalTeam';
import PhygitalGame from '@/models/PhygitalGame';

export async function POST(request) {
    try {
        await connectDB();
        const { targetCode, attackerCode, attackerTeamId, gameId } = await request.json();

        if (!targetCode || !attackerCode || !gameId) {
            return NextResponse.json({ success: false, error: 'Informations manquantes' }, { status: 400 });
        }

        const game = await PhygitalGame.findById(gameId);
        if (!game || !game.isEliminationEnabled) {
            return NextResponse.json({ success: false, error: 'Mécanique PvP désactivée' }, { status: 403 });
        }

        // Find the target team (victim)
        const victimTeam = await PhygitalTeam.findOne({ accessCodes: targetCode, gameId: gameId });
        if (!victimTeam) {
            return NextResponse.json({ success: false, error: 'Cible introuvable' }, { status: 404 });
        }

        // Check if attacker is trying to vote against their own team
        if (victimTeam._id.toString() === attackerTeamId) {
            return NextResponse.json({ success: false, error: 'Tir allié interdit !' }, { status: 400 });
        }

        // Look for existing threat against this specific player code
        let targetThreat = victimTeam.activeThreats?.find(t => t.targetCode === targetCode);
        
        if (!targetThreat) {
            targetThreat = {
                targetCode: targetCode,
                isDanger: false,
                rescuedBy: [],
                votes: []
            };
            if (!victimTeam.activeThreats) victimTeam.activeThreats = [];
            victimTeam.activeThreats.push(targetThreat);
            targetThreat = victimTeam.activeThreats[victimTeam.activeThreats.length - 1]; // get reference
        }

        if (targetThreat.isDanger) {
             return NextResponse.json({ success: false, error: 'Le joueur est déjà en danger' }, { status: 400 });
        }

        // Check if this attacker already voted in the last 5 minutes
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        // Cleanup old votes for this specific threat natively here before adding new logic
        targetThreat.votes = targetThreat.votes.filter(v => new Date(v.timestamp) > fiveMinsAgo);

        const hasAlreadyVoted = targetThreat.votes.some(v => v.voterCode === attackerCode);
        if (hasAlreadyVoted) {
            return NextResponse.json({ success: false, error: 'Vous avez déjà voté contre cette cible récemment' }, { status: 400 });
        }

        // Add the vote
        targetThreat.votes.push({
            voterCode: attackerCode,
            timestamp: new Date()
        });

        // Trigger Danger rule if votes reach threshold
        const votesReq = game.eliminationVotesReq || 3;
        if (targetThreat.votes.length >= votesReq) {
            targetThreat.isDanger = true;
            targetThreat.dangerStartedAt = new Date();
            // Note: Once in danger, the timer cleanup stops affecting it because the API ignores isDanger cleanups.
        }

        await victimTeam.save();

        return NextResponse.json({ success: true, message: 'Vote enregistré' });
    } catch (error) {
        console.error('Error in PvP vote:', error);
        return NextResponse.json({ success: false, error: 'Erreur Serveur' }, { status: 500 });
    }
}
