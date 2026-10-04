import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PhygitalTeam from '@/models/PhygitalTeam';
import PhygitalGame from '@/models/PhygitalGame';

export async function POST(request) {
    try {
        await connectDB();
        const { targetCode, rescuerCode, gameId } = await request.json();

        if (!targetCode || !rescuerCode || !gameId) {
            return NextResponse.json({ success: false, error: 'Informations manquantes' }, { status: 400 });
        }

        const game = await PhygitalGame.findById(gameId);
        if (!game || !game.isEliminationEnabled) {
            return NextResponse.json({ success: false, error: 'Mécanique PvP désactivée' }, { status: 403 });
        }

        // Find the team of the person being rescued
        const team = await PhygitalTeam.findOne({ accessCodes: targetCode, gameId: gameId });
        if (!team) {
            return NextResponse.json({ success: false, error: 'Code cible invalide' }, { status: 404 });
        }

        // Ensure rescuer belongs to the EXACT SAME TEAM
        if (!team.accessCodes.includes(rescuerCode)) {
            return NextResponse.json({ success: false, error: 'Seul un membre de l\'équipe peut effectuer un sauvetage !' }, { status: 403 });
        }

        if (targetCode === rescuerCode) {
            return NextResponse.json({ success: false, error: 'Vous ne pouvez pas vous sauver vous-même !' }, { status: 400 });
        }

        // Find the threat
        let targetThreat = team.activeThreats?.find(t => t.targetCode === targetCode);
        
        if (!targetThreat || !targetThreat.isDanger) {
            return NextResponse.json({ success: false, error: 'Ce joueur n\'est pas en danger' }, { status: 400 });
        }

        // Add the rescuer to the list if not already there
        if (!targetThreat.rescuedBy.includes(rescuerCode)) {
            targetThreat.rescuedBy.push(rescuerCode);
        } else {
             return NextResponse.json({ success: false, error: 'Vous avez déjà scanné ce joueur' }, { status: 400 });
        }

        // If rescues reach threshold, clear the threat completely!
        const rescuesReq = game.eliminationRescuesReq || 2;
        if (targetThreat.rescuedBy.length >= rescuesReq) {
            // Remove the threat from the array entirely
            team.activeThreats = team.activeThreats.filter(t => t.targetCode !== targetCode);
        }

        await team.save();

        return NextResponse.json({ success: true, message: 'Sauvetage enregistré !' });
    } catch (error) {
        console.error('Error in PvP rescue:', error);
        return NextResponse.json({ success: false, error: 'Erreur Serveur' }, { status: 500 });
    }
}
