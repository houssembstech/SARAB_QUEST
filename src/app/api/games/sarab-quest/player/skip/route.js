import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PhygitalTeam from '@/models/PhygitalTeam';
import PhygitalStage from '@/models/PhygitalStage';
import PhygitalGame from '@/models/PhygitalGame';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        await connectDB();
        const { teamId, stageId } = await request.json();

        if (!teamId || !stageId) {
            return NextResponse.json({ success: false, error: 'Données manquantes (teamId, stageId)' }, { status: 400 });
        }

        const team = await PhygitalTeam.findById(teamId);
        if (!team || team.completed) {
            return NextResponse.json({ success: false, error: 'Équipe invalide ou mission terminée' }, { status: 400 });
        }

        const game = await PhygitalGame.findById(team.gameId).populate('stages');
        if (!game || game.status !== 'active') {
            return NextResponse.json({ success: false, error: "La mission n'est pas active" }, { status: 400 });
        }

        const validStages = (game.stages || []).filter(Boolean);
        const actualCurrentStageId = validStages[team.currentStageIndex]?._id?.toString();

        if (!actualCurrentStageId || actualCurrentStageId !== stageId) {
            return NextResponse.json({ success: false, error: "Cette étape n'est pas votre étape actuelle" }, { status: 400 });
        }

        const stage = await PhygitalStage.findById(stageId);
        if (!stage) {
            return NextResponse.json({ success: false, error: 'Étape non trouvée' }, { status: 404 });
        }

        // Vérifier la règle des 15 minutes après la première équipe
        if (!stage.firstSolveTime) {
            return NextResponse.json({
                success: false,
                error: "Le passage de l'étape n'est pas disponible : aucune équipe n'a encore résolu cette étape."
            }, { status: 400 });
        }

        const elapsedMs = Date.now() - new Date(stage.firstSolveTime).getTime();
        const fifteenMinutesMs = 15 * 60 * 1000;
        if (elapsedMs < fifteenMinutesMs) {
            const remainingMinutes = Math.ceil((fifteenMinutesMs - elapsedMs) / 60000);
            return NextResponse.json({
                success: false,
                error: `Le passage de cette étape ne sera disponible que dans ${remainingMinutes} minute(s).`
            }, { status: 400 });
        }

        // Pénalité : 0 point pour cette étape, et -100 points sur le score de l'équipe (min 0)
        const penalty = 100;
        team.score = Math.max(0, team.score - penalty);
        team.currentStageIndex += 1;

        const now = new Date();
        team.stageRecords.push({
            stageId: stage._id,
            completedAt: now,
            pointsEarned: 0,
            hintsUsed: 0
        });

        if (team.currentStageIndex >= validStages.length) {
            team.completed = true;
            team.completedAt = now;
        }

        await team.save();

        return NextResponse.json({
            success: true,
            message: `Étape passée ! 0 point reçu et une pénalité de -${penalty} points a été appliquée.`,
            penalty,
            newScore: team.score,
            completed: team.completed
        });

    } catch (error) {
        console.error('Error skipping stage:', error);
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
    }
}
