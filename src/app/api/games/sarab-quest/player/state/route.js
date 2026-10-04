import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PhygitalTeam from '@/models/PhygitalTeam';
import PhygitalStage from '@/models/PhygitalStage';
import PhygitalGame from '@/models/PhygitalGame';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const teamId = searchParams.get('teamId');
        const accessCode = searchParams.get('accessCode'); // Specific player's code

        if (!teamId) {
            return NextResponse.json({ success: false, error: 'Team ID requis' }, { status: 400 });
        }

        await connectDB();
        
        const team = await PhygitalTeam.findById(teamId);
        if (!team) {
            return NextResponse.json({ success: false, error: 'Équipe non trouvée' }, { status: 404 });
        }

        const game = await PhygitalGame.findById(team.gameId).populate({
            path: 'stages',
            options: { sort: { 'order': 1 } }
        });
        
        if (!game) {
            return NextResponse.json({ success: false, error: 'Jeu non trouvé' }, { status: 404 });
        }

        // Determine if game has started
        const now = new Date();
        const hasStarted = game.status === 'active' || (game.startTime && now >= new Date(game.startTime));

        if (!hasStarted) {
             return NextResponse.json({
                success: true,
                data: {
                    gameState: 'waiting',
                    gameName: game.name,
                    gameDescription: game.description,
                    mapTexture: game.mapTexture || 'map_general',
                    startTime: game.startTime,
                    stagesSummary: game.stages.map((st, idx) => ({ id: st._id, title: st.title || `المهمة ${idx + 1}`, validationType: st.validationType })),
                    team: { name: team.teamName, score: team.score }
                }
            });
        }

        if (team.completed || team.currentStageIndex >= game.stages.length) {
            const leaderboard = await PhygitalTeam.find({ gameId: game._id })
                .sort({ score: -1, currentStageIndex: -1 })
                .select('teamName score currentStageIndex completed')
                .lean();
                
            return NextResponse.json({
                success: true,
                data: {
                    gameState: 'completed',
                    gameName: game.name,
                    gameDescription: game.description,
                    mapTexture: game.mapTexture || 'map_general',
                    stagesSummary: game.stages.map((st, idx) => ({ id: st._id, title: st.title || `المهمة ${idx + 1}`, validationType: st.validationType })),
                    leaderboard: leaderboard,
                    team: { name: team.teamName, score: team.score, completedAt: team.completedAt }
                }
            });
        }

        // Present current stage
        const currentStage = game.stages[team.currentStageIndex];
        
        // Only return necessary info, NEVER the correctAnswer
        const stageInfo = {
            _id: currentStage._id,
            title: currentStage.title,
            clueText: currentStage.clueText,
            validationType: currentStage.validationType,
            choices: currentStage.validationType === 'choice' ? currentStage.choices : undefined,
            puzzleImage: currentStage.validationType === 'puzzle' ? currentStage.puzzleImage : undefined,
            puzzleGridSize: currentStage.validationType === 'puzzle' ? currentStage.puzzleGridSize : undefined,
            order: currentStage.order,
            totalStages: game.stages.length,
        };
        
        // Expose a summary of all stages for the map (without correct answers)
        const stagesSummary = game.stages.map((st, idx) => ({
            id: st._id,
            title: st.title || `المهمة ${idx + 1}`,
            validationType: st.validationType,
            order: st.order
        }));
        
        // Fetch leaderboard Data
        const leaderboard = await PhygitalTeam.find({ gameId: game._id })
            .sort({ score: -1, currentStageIndex: -1 })
            .select('teamName score currentStageIndex completed')
            .lean();

        // -------------------------
        // PvP Elimination Logic
        // -------------------------
        let pvpState = {
            enabled: game.isEliminationEnabled || false,
            myThreatStatus: 'safe', // safe, danger
            rescuesNeeded: game.eliminationRescuesReq || 2,
            currentRescues: 0,
            enemies: []
        };

        if (game.isEliminationEnabled) {
            // 1. Clean up old votes (> 5 mins) across this team, and reset danger if expired
            let hasChanged = false;
            const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
            
            if (team.activeThreats && team.activeThreats.length > 0) {
                // We must use a backward loop or filter if we remove threats, but we just reset them.
                for (let i = team.activeThreats.length - 1; i >= 0; i--) {
                    let threat = team.activeThreats[i];
                    if (threat.isDanger) {
                        // Check if 5 minutes have passed since danger started
                        if (threat.dangerStartedAt && new Date(threat.dangerStartedAt) < fiveMinsAgo) {
                            // Penalty for not being rescued in time!
                            team.score = Math.max(0, team.score - 50); 
                            
                            // Move player to permanently eliminated!
                            if (!team.eliminatedPlayers) team.eliminatedPlayers = [];
                            if (!team.eliminatedPlayers.includes(threat.targetCode)) {
                                team.eliminatedPlayers.push(threat.targetCode);
                            }
                            
                            team.activeThreats.splice(i, 1); // Completely remove from active threats
                            hasChanged = true;
                        }
                    } else {
                        const originalVotes = threat.votes.length;
                        threat.votes = threat.votes.filter(v => new Date(v.timestamp) > fiveMinsAgo);
                        if (threat.votes.length !== originalVotes) hasChanged = true;
                        
                        // If no votes left, remove threat
                        if (threat.votes.length === 0) {
                            team.activeThreats.splice(i, 1);
                            hasChanged = true;
                        }
                    }
                }
                if (hasChanged) {
                    team.markModified('activeThreats');
                    await team.save();
                }
            }

            // 2. Determine my status
            if (accessCode) {
                if (team.eliminatedPlayers && team.eliminatedPlayers.includes(accessCode)) {
                    pvpState.myThreatStatus = 'eliminated';
                } else {
                    const myThreat = team.activeThreats?.find(t => t.targetCode === accessCode);
                    if (myThreat && myThreat.isDanger) {
                        pvpState.myThreatStatus = 'danger';
                        pvpState.currentRescues = myThreat.rescuedBy.length;
                        pvpState.dangerStartedAt = myThreat.dangerStartedAt;
                    }
                }
            }

            // 3. Get enemies to populate attack lists
            const allTeams = await PhygitalTeam.find({ gameId: game._id }).lean();
            pvpState.enemies = allTeams.filter(t => t._id.toString() !== teamId).map(t => ({
                teamId: t._id,
                teamName: t.teamName,
                // Do not send exact vote details to prevent cheating, just who is in danger or eliminated
                members: (t.accessCodes || []).map((code, idx) => {
                    const matchedThreat = (t.activeThreats || []).find(th => th.targetCode === code);
                    const isEliminated = t.eliminatedPlayers && t.eliminatedPlayers.includes(code);
                    return {
                        id: code, // Used as ID for the API
                        label: `Joueur ${idx + 1}`,
                        isDanger: matchedThreat ? matchedThreat.isDanger : false,
                        isEliminated: isEliminated,
                        votesPercent: (matchedThreat && !matchedThreat.isDanger) ? Math.min(100, Math.floor((matchedThreat.votes.length / (game.eliminationVotesReq || 3)) * 100)) : 0
                    };
                })
            }));
        }

        return NextResponse.json({
            success: true,
            data: {
                gameState: 'playing',
                gameName: game.name,
                gameDescription: game.description,
                mapTexture: game.mapTexture || 'map_general',
                stage: stageInfo,
                stagesSummary: stagesSummary,
                leaderboard: leaderboard,
                pvp: pvpState,
                team: { 
                    name: team.teamName, 
                    score: team.score,
                    currentStageIndex: team.currentStageIndex 
                }
            }
        });

    } catch (error) {
        console.error('Error fetching game state:', error);
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
    }
}
