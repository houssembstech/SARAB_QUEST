'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ScanLine, Map, Lightbulb, Trophy, LogOut, ArrowRight, AlertCircle, CheckCircle2, Navigation, Wifi, Fingerprint, Lock, MapPin, FileText, Puzzle, LayoutGrid, ShieldAlert } from 'lucide-react';
import styles from './phygital.module.css';
import { useLanguage } from '@/context/LanguageContext';
import SarabPuzzle from '@/components/SarabPuzzle';
import SarabTaquin from '@/components/SarabTaquin';
import SarabQrReader from '@/components/SarabQrReader';

export default function PhygitalGuestPlayerPage() {
    const { t, language } = useLanguage();
    const [accessCode, setAccessCode] = useState('');
    const [activeTab, setActiveTab] = useState('clues');
    const [teamSession, setTeamSession] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [gameStateData, setGameStateData] = useState(null);

    // Play state
    const [answer, setAnswer] = useState('');
    const [showQrReader, setShowQrReader] = useState(false);
    const [selectedChoices, setSelectedChoices] = useState([]);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isChecking, setIsChecking] = useState(false);

    // Map Panning state
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const mapViewportRef = require('react').useRef(null);
    
    // Auth Check
    const [currentUserRole, setCurrentUserRole] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('sarabSession');
        let currentCode = '';
        if (stored) {
            const data = JSON.parse(stored);
            currentCode = data.accessCode || '';
            setTeamSession(data);
            fetchGameState(data.teamId, data.accessCode);
        }
        
        // Check if current browser session belongs to an admin
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data && data.role) {
                    setCurrentUserRole(data.role);
                }
            })
            .catch(err => console.log('Not an admin / not logged in'));
    }, []);

    const fetchGameState = async (teamId, codeOverride = '') => {
        try {
            const codeToUse = codeOverride || teamSession?.accessCode || (JSON.parse(localStorage.getItem('sarabSession') || '{}')?.accessCode) || '';
            const res = await fetch(`/api/games/sarab-quest/player/state?teamId=${teamId}&accessCode=${codeToUse}`);
            const data = await res.json();
            if (data.success) {
                setGameState(data.data.gameState);
                setGameStateData(data.data);
            } else {
                localStorage.removeItem('sarabSession');
                setTeamSession(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Auto-center map on current active node 
    useEffect(() => {
        if (activeTab === 'map' && gameStateData && mapViewportRef.current) {
            const currentMap = gameStateData.mapTexture || 'map_general';
            const MapLayouts = {
                map_general: [{ x: 65, y: 25 }, { x: 35, y: 35 }, { x: 48, y: 65 }, { x: 75, y: 75 }, { x: 50, y: 85 }, { x: 20, y: 70 }, { x: 15, y: 40 }, { x: 40, y: 20 }, { x: 80, y: 40 }, { x: 85, y: 65 }, { x: 65, y: 90 }, { x: 30, y: 90 }, { x: 10, y: 55 }, { x: 25, y: 20 }, { x: 55, y: 15 }, { x: 85, y: 25 }, { x: 90, y: 50 }],
                map_desert: [{ x: 80, y: 20 }, { x: 50, y: 40 }, { x: 30, y: 60 }, { x: 60, y: 80 }, { x: 85, y: 60 }, { x: 70, y: 30 }, { x: 40, y: 20 }, { x: 20, y: 40 }, { x: 15, y: 70 }, { x: 40, y: 90 }, { x: 75, y: 90 }, { x: 90, y: 75 }, { x: 95, y: 45 }, { x: 65, y: 15 }, { x: 30, y: 10 }, { x: 10, y: 30 }, { x: 45, y: 50 }],
                map_foret: [{ x: 20, y: 20 }, { x: 40, y: 40 }, { x: 25, y: 70 }, { x: 60, y: 75 }, { x: 80, y: 50 }, { x: 70, y: 25 }, { x: 90, y: 20 }, { x: 95, y: 45 }, { x: 90, y: 75 }, { x: 70, y: 95 }, { x: 40, y: 95 }, { x: 15, y: 85 }, { x: 10, y: 55 }, { x: 30, y: 25 }, { x: 50, y: 15 }, { x: 80, y: 10 }, { x: 55, y: 30 }],
                map_plage: [{ x: 50, y: 85 }, { x: 25, y: 65 }, { x: 35, y: 35 }, { x: 65, y: 30 }, { x: 80, y: 60 }, { x: 60, y: 75 }, { x: 80, y: 85 }, { x: 95, y: 65 }, { x: 90, y: 35 }, { x: 75, y: 15 }, { x: 45, y: 10 }, { x: 15, y: 25 }, { x: 10, y: 55 }, { x: 20, y: 80 }, { x: 40, y: 95 }, { x: 15, y: 45 }, { x: 60, y: 50 }]
            };
            const layout = MapLayouts[currentMap] || MapLayouts.map_general;
            const currentIdx = gameStateData.team?.currentStageIndex || 0;
            const point = layout[currentIdx % layout.length];

            const vW = mapViewportRef.current.clientWidth;
            // The map is 250% of the viewport. So mapWidth = 2.5 * vW.
            // Center of viewport = vW / 2
            // Node position inside map is (point.x / 100) * 2.5 * vW
            // shift needed: panX = vW / 2 - point.x/100 * 2.5 * vW
            const targetX = vW * (0.5 - 2.5 * point.x / 100);
            const targetY = vW * (0.5 - 2.5 * point.y / 100); // Because height = width for viewport

            import('qrcode').then(QRCode => {
                 QRCode.toDataURL(`rescue:${teamSession.accessCode}`, { width: 250, margin: 2, color: { dark: '#ff0000', light: '#ffffff' } })
                 .then(url => setMyDangerQr(url));
            });
        }
    }, [gameStateData?.pvp?.myThreatStatus]);

    const [dangerTimeLeft, setDangerTimeLeft] = useState('');
    useEffect(() => {
        let interval;
        if (gameStateData?.pvp?.myThreatStatus === 'danger' && gameStateData?.pvp?.dangerStartedAt) {
            const updateTimer = () => {
                const dangerStart = new Date(gameStateData.pvp.dangerStartedAt).getTime();
                const now = new Date().getTime();
                const diff = (dangerStart + 5 * 60 * 1000) - now;
                if (diff <= 0) {
                    setDangerTimeLeft('00:00');
                } else {
                    const m = Math.floor(diff / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    setDangerTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
                }
            };
            updateTimer();
            interval = setInterval(updateTimer, 1000);
        }
        return () => clearInterval(interval);
    }, [gameStateData?.pvp?.myThreatStatus, gameStateData?.pvp?.dangerStartedAt]);

    const castPvPVote = async (targetId) => {
        if (!confirm('Voulez-vous vraiment cibler ce joueur ?')) return;
        try {
            const res = await fetch('/api/games/sarab-quest/player/pvp/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    targetCode: targetId,
                    attackerCode: teamSession.accessCode,
                    attackerTeamId: teamSession.teamId,
                    gameId: gameStateData.gameId || teamSession.gameId
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('Attaque enregistrée !');
                fetchGameState(teamSession.teamId);
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Erreur serveur');
        }
    };

    const submitNfcAnswer = async (payload) => {
        if (isChecking) return;
        setIsChecking(true);
        setMessage({ text: t('loadingData'), type: 'success' });
        
        try {
            // Check if rescue payload
            if (payload.startsWith('rescue:')) {
                const targetCode = payload.split(':')[1];
                const res = await fetch('/api/games/sarab-quest/player/pvp/rescue', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        targetCode,
                        rescuerCode: teamSession.accessCode,
                        gameId: gameStateData.gameId || teamSession.gameId 
                    })
                });
                const data = await res.json();
                
                // Si on utilise l'URL NFC, on le nettoie
                if (window.location.search.includes('nfc_payload')) {
                    window.history.replaceState({}, document.title, window.location.pathname);
                }

                if (data.success) {
                    setMessage({ text: data.message, type: 'success' });
                } else {
                    setMessage({ text: data.error, type: 'error' });
                }
                setTimeout(() => {
                    setIsChecking(false);
                    setMessage({text: '', type: ''});
                    fetchGameState(teamSession.teamId);
                }, 3000);
                window.isProcessingNfc = false;
                return;
            }

            const res = await fetch('/api/games/sarab-quest/player/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId: teamSession.teamId,
                    stageId: gameStateData.stage._id,
                    answer: payload
                })
            });
            const data = await res.json();
            
            // Si on utilise l'URL, on le nettoie
            if (window.location.search.includes('nfc_payload')) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
            window.isProcessingNfc = false;

            if (data.success) {
                setMessage({ text: data.message || t('successSubmissionStage'), type: 'success' });
                setGameStateData(prev => ({
                    ...prev,
                    team: { ...prev.team, score: prev.team.score + (gameStateData.stage.basePoints || 100) }
                }));
                setTimeout(() => {
                    setMessage({ text: '', type: '' });
                    fetchGameState(teamSession.teamId);
                    setIsChecking(false);
                }, 1500);
            } else {
                setMessage({ text: data.error || data.message || t('invalidActionCode'), type: 'error' });
                setTimeout(() => {
                    setIsChecking(false);
                    setMessage({ text: '', type: '' });
                }, 3000);
            }
        } catch (error) {
            setMessage({ text: 'Erreur Serveur', type: 'error' });
            window.isProcessingNfc = false;
            setIsChecking(false);
        }
    };

    // Handle incoming NFC payloads from URL (lorsque le tél ouvre un nouvel onglet)
    useEffect(() => {
        if (gameStateData && gameStateData.stage && teamSession && gameState === 'playing') {
            const urlParams = new URLSearchParams(window.location.search);
            const nfcPayload = urlParams.get('nfc_payload');
            
            if (nfcPayload) {
                if (window.isProcessingNfc) return;
                window.isProcessingNfc = true;
                submitNfcAnswer(nfcPayload);
            }
        }
    }, [gameStateData, teamSession, gameState]);

    const handleNfcReadLive = async () => {
        if ('NDEFReader' in window) {
            try {
                const ndef = new window.NDEFReader();
                await ndef.scan();
                setMessage({ text: t('nfcReadyToScan') || 'Approchez le tag NFC...', type: 'success' });
                
                ndef.addEventListener("reading", ({ message, serialNumber }) => {
                    for (const record of message.records) {
                        try {
                            const decoder = new TextDecoder();
                            const ndefData = decoder.decode(record.data);
                            // Le tag contient soit un lien, soit la clé brute. On utilise Regex pour éviter les erreurs d'encodage URI (les bytes de préfixe).
                            const match = ndefData.match(/nfc_payload=([^&]+)/);
                            if (match && match[1]) {
                                submitNfcAnswer(match[1]);
                            } else {
                                // Si c'est juste du texte sans URL
                                // on enlève les caractères invisibles (bytes de contrôle NFC potentiel)
                                submitNfcAnswer(ndefData.replace(/[\x00-\x1F\x7F-\x9F]/g, ''));
                            }
                            break; // submit first valid record
                        } catch (err) {
                            console.error(err);
                        }
                    }
                });
            } catch (error) {
                setMessage({ text: t('nfcReadingError') || 'Veuillez activer le NFC sur votre appareil.', type: 'error' });
            }
        } else {
            setMessage({ text: t('nfcNotSupported') || 'Le lecteur NFC n\'est pas supporté par votre navigateur actuel (utilisez Chrome sur Android).', type: 'error' });
        }
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };

    const handleMouseUp = () => { setIsDragging(false); };

    const handleTouchStart = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        setPan({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    };

    const handleTouchEnd = () => { setIsDragging(false); };
    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setIsChecking(true);
        const res = await fetch('/api/games/sarab-quest/player/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessCode })
        });
        const data = await res.json();

        if (data.success) {
            localStorage.setItem('sarabSession', JSON.stringify(data.data));
            setTeamSession(data.data);
            fetchGameState(data.data.teamId);
        } else {
            setMessage({ text: data.error || data.message || t('errorAccess') || 'Code Invalide', type: 'error' });
        }
        setIsChecking(false);
    };

    const handleSubmitAnswer = async (e, directAnswer = null) => {
        if (e) e.preventDefault();

        let finalAnswer = directAnswer !== null ? directAnswer : answer;
        if (typeof finalAnswer === 'string' && finalAnswer.startsWith('rescue:')) {
            submitNfcAnswer(finalAnswer);
            return;
        }

        if (gameStateData?.stage?.validationType === 'choice') {
            if (selectedChoices.length === 0) {
                setMessage({ text: t('selectOneAnswer') || 'Sélectionnez une réponse', type: 'error' });
                return;
            }
            finalAnswer = selectedChoices.sort().join(',');
        } else if (!finalAnswer.trim()) {
            setMessage({ text: t('enterAnswer') || 'Entrez votre réponse', type: 'error' });
            return;
        }

        setMessage({ text: '', type: '' });
        setIsChecking(true);

        try {
            const res = await fetch('/api/games/sarab-quest/player/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId: teamSession.teamId,
                    stageId: gameStateData.stage._id,
                    answer: finalAnswer
                })
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ text: data.message || t('successAccess') || 'Code Validé !', type: 'success' });
                setAnswer('');
                setSelectedChoices([]);
                setGameStateData(prev => ({
                    ...prev,
                    team: { ...prev.team, score: prev.team.score + (gameStateData.stage?.basePoints || 100) }
                }));
                setTimeout(() => {
                    setMessage({ text: '', type: '' });
                    fetchGameState(teamSession.teamId);
                }, 1500);
            } else {
                setMessage({ text: data.error || data.message || t('errorAccess') || 'Erreur d\'accès', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: t('errorServer') || 'Erreur Serveur', type: 'error' });
        } finally {
            setIsChecking(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('sarabSession');
        setTeamSession(null);
        setGameState(null);
    };

    if (!teamSession) {
        return (
            <div className={styles.container} style={{ position: 'relative', direction: language === 'ar' ? 'rtl' : 'ltr' }}>
                <Link href="/menu" style={{ position: 'absolute', top: '20px', left: language === 'ar' ? '20px' : 'auto', right: language === 'ar' ? 'auto' : '20px', color: '#a67c52', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10, fontFamily: 'Rajdhani', fontWeight: 'bold' }}>
                    <ArrowRight size={24} style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }} />
                    <span style={{ fontSize: '1.2rem' }}>{t('back')}</span>
                </Link>

                <div className={styles.loginContainer}>
                    <div className={styles.loginCard}>
                        <Image src="/images/logo_games5-.png" alt="Sarab Quest Logo" width={200} height={100} style={{ objectFit: 'contain', margin: '0 auto', display: 'block', filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.5))', width: 'auto', height: 'auto' }} priority />
                        <h1 className={styles.loginTitle} style={{ marginTop: '10px' }}>SARAB QUEST</h1>
                        <h2 className={styles.loginSubtitle}>{t('sarabQuestSubtitle')}</h2>

                        <form onSubmit={handleLogin}>
                            <input
                                type="text"
                                className={styles.codeInput}
                                placeholder={t('accessCode')}
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                                maxLength={6}
                                disabled={isChecking}
                                style={{ direction: language === 'ar' ? 'rtl' : 'ltr', textAlign: 'center' }}
                            />

                            {message.text && (
                                <p className={`${styles.messageStatus} ${message.type === 'error' ? styles.messageError : styles.messageSuccess}`}>
                                    {message.text}
                                </p>
                            )}

                            <button type="submit" className={styles.joinBtn} disabled={isChecking}>
                                {isChecking ? t('syncingBtn') : t('startMissionBtn')}
                            </button>
                        </form>

                        {(currentUserRole === 'admin' || currentUserRole === 'director') && (
                            <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '1px solid rgba(166, 124, 82, 0.3)' }}>
                                <Link href="/dashboard/games/sarab-quest" style={{textDecoration: 'none'}}>
                                    <button style={{
                                        width: '100%',
                                        background: 'transparent',
                                        border: '1px solid #a67c52',
                                        color: '#a67c52',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        fontFamily: 'Orbitron',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseOver={(e) => { e.target.style.background = 'rgba(166, 124, 82, 0.1)'; e.target.style.color = '#ff9900'; }}
                                    onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#a67c52'; }}
                                    >
                                        ⚙️ {t('adminDashboardBtn')}
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (!gameState) {
        return <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ color: '#00f0ff', fontFamily: 'Orbitron', fontSize: '1.5rem', animation: 'blink-caret 1s infinite' }}>{t('systemLoading') || 'CHARGEMENT...'}</div>
        </div>
    }

    return (
        <div className={styles.container} style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
            
            {gameState === 'playing' && gameStateData?.pvp?.myThreatStatus === 'danger' ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,0,0,0.15)', padding: '20px', zIndex: 100, position: 'relative' }}>
                    <style>{`
                        @keyframes pulse-red { 0% { box-shadow: inset 0 0 50px rgba(255,0,0,0.4); } 100% { box-shadow: inset 0 0 150px rgba(255,0,0,0.9); } }
                        .danger-bg { position: fixed; inset: 0; animation: pulse-red 0.8s infinite alternate; pointer-events: none; z-index: -1; }
                    `}</style>
                    <div className="danger-bg"></div>
                    
                    <AlertCircle size={80} color="#ff0000" style={{ marginBottom: '10px' }} />
                    <h1 style={{color: '#ff0000', fontSize: '2rem', textAlign: 'center', marginBottom: '15px', textTransform: 'uppercase', fontFamily: 'Orbitron', fontWeight: 'bold'}}>{t('dangerAlert') || 'DANGER D\'ÉLIMINATION'}</h1>
                    <p style={{color: '#fff', fontSize: '1.2rem', textAlign: 'center', marginBottom: '30px', fontFamily: 'Rajdhani', background: 'rgba(0,0,0,0.6)', padding: '15px', borderRadius: '8px', border: '1px solid #ff0000'}}>
                        Vous êtes ciblé par une attaque ennemie ! Vous devez vous faire sauver par <b>{Math.max(0, gameStateData.pvp.rescuesNeeded - (gameStateData.pvp.currentRescues || 0))}</b> de vos coéquipiers pour survivre !
                    </p>

                    {dangerTimeLeft && (
                        <div style={{background: 'rgba(0,0,0,0.8)', padding: '10px 20px', borderRadius: '30px', border: '2px solid #ff4444', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 0 20px rgba(255,0,0,0.6)'}}>
                            <span style={{color: '#ffb74d', fontFamily: 'Orbitron', fontSize: '0.9rem', textTransform: 'uppercase'}}>Temps Restant</span>
                            <span style={{color: '#fff', fontFamily: 'Rajdhani', fontSize: '1.8rem', fontWeight: 'bold', letterSpacing: '2px'}}>{dangerTimeLeft}</span>
                        </div>
                    )}
                    
                    <div style={{background: '#fff', padding: '15px', borderRadius: '10px', boxShadow: '0 0 30px rgba(255,0,0,0.5)', marginBottom: '30px'}}>
                        {myDangerQr ? (
                            <img src={myDangerQr} alt="QR Code de Sauvetage" style={{width: '220px', height: '220px', display: 'block'}} />
                        ) : (
                            <div style={{width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ccc', color: '#000'}}>Chargement...</div>
                        )}
                    </div>
                    
                    <p style={{color: '#ffb74d', fontSize: '0.9rem', textAlign: 'center', maxWidth: '300px'}}>
                        Dites à vos coéquipiers d'ouvrir leur appareil photo (ou le scanner du jeu) et de scanner ce QR Code.
                    </p>
                </div>
            ) : (
                <div className={styles.contentWrapper}>
                    {gameStateData?.pvp?.myThreatStatus === 'eliminated' && (
                        <div style={{background: '#1a0000', borderBottom: '2px solid #ff0000', padding: '10px', textAlign: 'center', color: '#ff0000', fontWeight: 'bold', fontFamily: 'Orbitron', letterSpacing: '2px', textTransform: 'uppercase', animation: 'blink-caret 2s infinite'}}>
                            {t('spectatorModeBanner') || 'ÉLIMINÉ - MODE SPECTATEUR'}
                        </div>
                    )}
                    {/* HUD Top */}
                <header className={styles.hud} style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                    <div style={{ textAlign: language === 'ar' ? 'left' : 'right', zIndex: 3 }}>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontFamily: 'Orbitron' }}>{t('totalScore') || 'SCORE TOTAL'}</div>
                        <div className={styles.scoreValue}>{gameStateData?.team?.score || 0}</div>
                    </div>

                    <div style={{ textAlign: language === 'ar' ? 'right' : 'left', zIndex: 3 }}>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontFamily: 'Orbitron' }}>{t('team') || 'ÉQUIPE'}</div>
                        <div className={styles.teamName}>
                            {teamSession.teamName}
                        </div>
                    </div>
                </header>

                <main className={styles.mainArea}>
                    {gameStateData?.gameDescription && (
                        <div style={{
                            background: 'rgba(19, 25, 34, 0.6)',
                            border: '1px solid rgba(166, 124, 82, 0.3)',
                            borderRadius: '8px',
                            padding: '20px',
                            marginBottom: '25px',
                            textAlign: 'center',
                            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)'
                        }}>
                            <h3 style={{ fontFamily: 'Cinzel Decorative', color: '#00f0ff', fontSize: '1.2rem', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                                {gameStateData.gameName}
                            </h3>
                            <div style={{ width: '40px', height: '2px', background: '#a67c52', margin: '0 auto 15px' }}></div>
                            <p style={{ color: '#e2e8f0', fontFamily: 'Rajdhani', fontSize: '1.1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {gameStateData.gameDescription}
                            </p>
                        </div>
                    )}
                    
                    {gameState === 'waiting' && (
                        <div style={{ textAlign: 'center', marginTop: '40px' }}>
                            <AlertCircle size={60} color="#ff9900" style={{ margin: '0 auto 20px' }} />
                            <h2 style={{ fontFamily: 'Rajdhani', fontSize: '2rem', color: '#ff9900', marginBottom: '15px' }}>{t('waitingMode') || 'MODE ATTENTE'}</h2>
                            <p style={{ color: '#e2e8f0', marginBottom: '30px', fontSize: '1.2rem' }}>{t('waitingText') || 'En attente du départ...'}</p>
                            <button onClick={() => fetchGameState(teamSession.teamId)} className={styles.submitBtn} style={{ padding: '15px 30px' }}>
                                {t('refreshConnection') || 'Rafraîchir'}
                            </button>
                        </div>
                    )}

                    {gameState === 'completed' && (
                        <div style={{ textAlign: 'center', marginTop: '40px' }}>
                            <Trophy size={80} color="#00e599" style={{ margin: '0 auto 20px' }} />
                            <h2 style={{ fontFamily: 'Rajdhani', fontSize: '2.5rem', color: '#00e599', textShadow: '0 0 20px rgba(0,229,153,0.5)', marginBottom: '15px' }}>{t('missionCompleted') || 'VICTOIRE'}</h2>
                            <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{t('missionCompletedDesc') || 'Toutes les étapes ont été validées.'}</p>
                            <div style={{ background: 'rgba(0,240,255,0.1)', border: '2px solid #00f0ff', padding: '20px', borderRadius: '10px', display: 'inline-block', margin: '20px 0' }}>
                                <div style={{ fontSize: '1rem', color: '#00f0ff', textTransform: 'uppercase' }}>{t('finalScore') || 'Score Final'}</div>
                                <div style={{ fontSize: '3rem', fontFamily: 'Orbitron', color: '#fff', fontWeight: 'bold' }}>{gameStateData.team.score}</div>
                            </div>
                        </div>
                    )}

                    {gameState === 'playing' && gameStateData.stage && activeTab === 'clues' && (
                        <div className={styles.actionPanel}>
                            {(gameStateData.stage.validationType !== 'puzzle' && gameStateData.stage.validationType !== 'taquin') && (
                                <div className={styles.clueCard}>
                                    <div className={styles.clueTitleWrap}>
                                        <div className={styles.clueTitle}>{t('currentClue') || 'Indice actuel'}</div>
                                    </div>
                                    <div className={styles.clueCardInner}>
                                        <div className={`${styles.clueText} ${styles.typing}`}>
                                            {gameStateData.stage.clueText}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {gameStateData.stage.validationType === 'puzzle' && (
                                <SarabPuzzle 
                                    stage={gameStateData.stage} 
                                    t={t}
                                    onSolve={() => {
                                        if (isChecking) return;
                                        setAnswer('PUZZLE_SOLVED');
                                        setIsChecking(true);
                                        fetch('/api/games/sarab-quest/player/verify', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                teamId: teamSession.teamId,
                                                stageId: gameStateData.stage._id,
                                                answer: 'PUZZLE_SOLVED'
                                            })
                                        }).then(res => res.json()).then(data => {
                                            if (data.success) {
                                                setMessage({ text: data.message || t('successAccess') || 'Code Validé !', type: 'success' });
                                                setGameStateData(prev => ({
                                                    ...prev,
                                                    team: { ...prev.team, score: prev.team.score + (gameStateData.stage?.basePoints || 100) }
                                                }));
                                                setTimeout(() => {
                                                    setMessage({ text: '', type: '' });
                                                    fetchGameState(teamSession.teamId);
                                                    setIsChecking(false);
                                                }, 1500);
                                            } else {
                                                setMessage({ text: data.error || data.message || t('errorAccess') || 'Erreur d\'accès', type: 'error' });
                                                setIsChecking(false);
                                            }
                                        }).catch(() => {
                                            setMessage({ text: t('errorServer') || 'Erreur Serveur', type: 'error' });
                                            setIsChecking(false);
                                        });
                                    }} 
                                />
                            )}
                            
                            {gameStateData.stage.validationType === 'taquin' && (
                                <SarabTaquin 
                                    stage={gameStateData.stage} 
                                    t={t}
                                    onSolve={() => {
                                        if (isChecking) return;
                                        setAnswer('TAQUIN_SOLVED');
                                        setIsChecking(true);
                                        fetch('/api/games/sarab-quest/player/verify', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                teamId: teamSession.teamId,
                                                stageId: gameStateData.stage._id,
                                                answer: 'TAQUIN_SOLVED'
                                            })
                                        }).then(res => res.json()).then(data => {
                                            if (data.success) {
                                                setMessage({ text: data.message || t('successAccess') || 'Code Validé !', type: 'success' });
                                                setGameStateData(prev => ({
                                                    ...prev,
                                                    team: { ...prev.team, score: prev.team.score + (gameStateData.stage?.basePoints || 100) }
                                                }));
                                                setTimeout(() => {
                                                    setMessage({ text: '', type: '' });
                                                    fetchGameState(teamSession.teamId);
                                                    setIsChecking(false);
                                                }, 1500);
                                            } else {
                                                setMessage({ text: data.error || data.message || t('errorAccess') || 'Erreur d\'accès', type: 'error' });
                                                setIsChecking(false);
                                            }
                                        }).catch(() => {
                                            setMessage({ text: t('errorServer') || 'Erreur Serveur', type: 'error' });
                                            setIsChecking(false);
                                        });
                                    }} 
                                />
                            )}

                            {gameStateData.stage.validationType === 'choice' && (
                                <div className={styles.choiceGrid}>
                                    {gameStateData.stage.choices?.map((choice, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            className={`${styles.choiceBtn} ${selectedChoices.includes(choice) ? styles.selected : ''}`}
                                            onClick={() => {
                                                if (selectedChoices.includes(choice)) {
                                                    setSelectedChoices(selectedChoices.filter(c => c !== choice));
                                                } else {
                                                    setSelectedChoices([...selectedChoices, choice]);
                                                }
                                            }}
                                            disabled={isChecking}
                                        >
                                            <span style={{ fontSize: '1.2rem', fontFamily: 'Orbitron', color: '#ffb74d' }}>{String.fromCharCode(65 + i)}</span>
                                            <span>{choice}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {gameStateData.stage.validationType === 'qr' && (
                                <>
                                    <button className={styles.scanBtn} onClick={() => setShowQrReader(true)}>
                                        <ScanLine className={styles.scanIcon} /> {t('scanQrBtn') || 'Scanner un Code'}
                                    </button>
                                    
                                    {showQrReader && (
                                        <SarabQrReader 
                                            t={t}
                                            onCancel={() => setShowQrReader(false)} 
                                            onScanSuccess={(decodedText) => {
                                                setShowQrReader(false);
                                                setAnswer(decodedText);
                                                handleSubmitAnswer(null, decodedText);
                                            }} 
                                        />
                                    )}
                                </>
                            )}

                            {gameStateData.stage.validationType === 'nfc' && (
                                <div className={styles.nfcZone} onClick={handleNfcReadLive} style={{ cursor: 'pointer' }}>
                                    <div className={styles.nfcWaves}></div>
                                    <Wifi size={50} color="#00e5ff" style={{ margin: '0 auto 10px' }} />
                                    <div style={{ fontFamily: 'Rajdhani', fontSize: '1.2rem', fontWeight: 'bold', color: '#00e5ff' }}>{t('startNfcBtn') || 'Lancer la lecture Live NFC'}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '10px' }}>Appuyez ici, puis approchez le Tag !</div>
                                </div>
                            )}

                            {(gameStateData.stage.validationType === 'text' || gameStateData.stage.validationType === 'choice') && (
                                <form onSubmit={handleSubmitAnswer} className={styles.inputGroup} style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                                    <button type="submit" className={styles.submitBtn} disabled={isChecking} style={{ 
                                        borderLeft: language === 'ar' ? 'none' : '2px solid #334354', 
                                        borderRight: language === 'ar' ? '2px solid #334354' : 'none' 
                                    }}>
                                        {t('confirmBtn') || 'Confirmer'}
                                    </button>
                                    <input
                                        type="text"
                                        placeholder={gameStateData.stage.validationType === 'choice' ? (t('inputChoicePlaceholder') || 'Choix multiple') : (t('inputAnswerPlaceholder') || 'Réponse...')}
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        disabled={isChecking}
                                        style={{ textAlign: language === 'ar' ? 'right' : 'left' }}
                                    />
                                </form>
                            )}

                            {message.text && (
                                <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', letterSpacing: '1px' }} className={message.type === 'success' ? styles.messageSuccess : styles.messageError}>
                                    {message.text}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'leaderboard' && (gameState === 'playing' || gameState === 'completed') && (
                        <div className={styles.actionPanel} style={{ background: 'rgba(19, 25, 34, 0.8)' }}>
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <Trophy size={40} color="#ff9900" style={{ margin: '0 auto 10px' }} />
                                <h3 style={{ fontFamily: 'Rajdhani', fontSize: '1.8rem', color: '#ff9900' }}>{t('liveRanking') || 'Classement Live'}</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {gameStateData?.leaderboard?.map((team, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        background: team.teamName === teamSession.teamName ? 'linear-gradient(90deg, rgba(0, 229, 153, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%)' : 'rgba(0,0,0,0.4)',
                                        padding: '15px', borderRadius: '8px',
                                        border: team.teamName === teamSession.teamName ? '1px solid #00e599' : '1px solid rgba(166,124,82,0.2)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{
                                                fontSize: '1.5rem', fontFamily: 'Orbitron', fontWeight: 'bold',
                                                color: idx === 0 ? '#ff9900' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#b08d5b' : '#64748b',
                                                width: '30px', textAlign: 'center'
                                            }}>{idx + 1}</div>
                                            <div style={{ fontFamily: 'Rajdhani', fontSize: '1.2rem', color: team.teamName === teamSession.teamName ? '#00e599' : '#fff' }}>
                                                {team.teamName} {team.teamName === teamSession.teamName ? (t('youLabel') || '(Vous)') : ''}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: language === 'ar' ? 'left' : 'right' }}>
                                            <div style={{ fontSize: '1.5rem', fontFamily: 'Orbitron', color: '#00f0ff', fontWeight: 'bold' }}>{team.score}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#a67c52' }}>{t('stageLabel') || 'Étape'} {team.currentStageIndex}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'map' && (gameState === 'playing' || gameState === 'completed') && (
                        <div className={styles.complexMapWrapper} style={{ direction: 'ltr' }}>
                            <div
                                className={styles.mapCircleContainer}
                                ref={mapViewportRef}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                style={{
                                    border: '12px solid #5a3d2b',
                                    outline: '4px solid #1a110b',
                                    boxShadow: '0 0 30px rgba(90, 61, 43, 0.8), inset 0 0 40px rgba(0,0,0,0.8)',
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    width: '100%',
                                    aspectRatio: '1',
                                    borderRadius: '50%'
                                }}
                            >
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, width: '250%', height: '250%',
                                    backgroundImage: `url('/images/maps_photos/${gameStateData?.mapTexture || 'map_general'}.jfif')`,
                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                    transform: `translate(${pan.x}px, ${pan.y}px)`,
                                    transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                    willChange: 'transform'
                                }}>
                                    <div className={styles.mapBackgroundOverlay} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }}></div>

                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <MapPin size={40} color="#00e5ff" style={{ opacity: 0.1 }} />
                                    </div>

                                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, overflow: 'visible', pointerEvents: 'none' }}>
                                        {gameStateData?.stagesSummary?.map((stage, idx) => {
                                            if (idx === 0) return null;
                                            const currentMap = gameStateData?.mapTexture || 'map_general';
                                            const MapLayouts = {
                                                map_general: [{ x: 65, y: 25 }, { x: 35, y: 35 }, { x: 48, y: 65 }, { x: 75, y: 75 }, { x: 50, y: 85 }, { x: 20, y: 70 }, { x: 15, y: 40 }, { x: 40, y: 20 }, { x: 80, y: 40 }, { x: 85, y: 65 }, { x: 65, y: 90 }, { x: 30, y: 90 }, { x: 10, y: 55 }, { x: 25, y: 20 }, { x: 55, y: 15 }, { x: 85, y: 25 }, { x: 90, y: 50 }],
                                                map_desert: [{ x: 80, y: 20 }, { x: 50, y: 40 }, { x: 30, y: 60 }, { x: 60, y: 80 }, { x: 85, y: 60 }, { x: 70, y: 30 }, { x: 40, y: 20 }, { x: 20, y: 40 }, { x: 15, y: 70 }, { x: 40, y: 90 }, { x: 75, y: 90 }, { x: 90, y: 75 }, { x: 95, y: 45 }, { x: 65, y: 15 }, { x: 30, y: 10 }, { x: 10, y: 30 }, { x: 45, y: 50 }],
                                                map_foret: [{ x: 20, y: 20 }, { x: 40, y: 40 }, { x: 25, y: 70 }, { x: 60, y: 75 }, { x: 80, y: 50 }, { x: 70, y: 25 }, { x: 90, y: 20 }, { x: 95, y: 45 }, { x: 90, y: 75 }, { x: 70, y: 95 }, { x: 40, y: 95 }, { x: 15, y: 85 }, { x: 10, y: 55 }, { x: 30, y: 25 }, { x: 50, y: 15 }, { x: 80, y: 10 }, { x: 55, y: 30 }],
                                                map_plage: [{ x: 50, y: 85 }, { x: 25, y: 65 }, { x: 35, y: 35 }, { x: 65, y: 30 }, { x: 80, y: 60 }, { x: 60, y: 75 }, { x: 80, y: 85 }, { x: 95, y: 65 }, { x: 90, y: 35 }, { x: 75, y: 15 }, { x: 45, y: 10 }, { x: 15, y: 25 }, { x: 10, y: 55 }, { x: 20, y: 80 }, { x: 40, y: 95 }, { x: 15, y: 45 }, { x: 60, y: 50 }]
                                            };
                                            const layout = MapLayouts[currentMap] || MapLayouts.map_general;
                                            const start = layout[(idx - 1) % layout.length];
                                            const end = layout[idx % layout.length];
                                            const curvature = (idx % 2 === 0) ? 20 : -20;
                                            const cpX = (start.x + end.x) / 2 + curvature;
                                            const cpY = (start.y + end.y) / 2 + curvature;
                                            const pathData = `M ${start.x},${start.y} Q ${cpX},${cpY} ${end.x},${end.y}`;
                                            const currentIdx = gameStateData?.team?.currentStageIndex || 0;
                                            const isUnlocked = idx <= currentIdx;

                                            return (
                                                <g key={idx}>
                                                    <path d={pathData} fill="none" stroke="rgba(0, 240, 255, 0.3)" strokeWidth="0.3" strokeDasharray="1 1" />
                                                    {isUnlocked && (
                                                        <path d={pathData} fill="none" stroke="#00f0ff" strokeWidth="0.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 1.5px rgba(0,240,255,1))' }} />
                                                    )}
                                                </g>
                                            );
                                        })}
                                    </svg>

                                    {gameStateData?.stagesSummary?.map((stage, idx) => {
                                        const currentMap = gameStateData?.mapTexture || 'map_general';
                                        const MapLayouts = {
                                            map_general: [{ x: 65, y: 25 }, { x: 35, y: 35 }, { x: 48, y: 65 }, { x: 75, y: 75 }, { x: 50, y: 85 }, { x: 20, y: 70 }, { x: 15, y: 40 }, { x: 40, y: 20 }, { x: 80, y: 40 }, { x: 85, y: 65 }, { x: 65, y: 90 }, { x: 30, y: 90 }, { x: 10, y: 55 }, { x: 25, y: 20 }, { x: 55, y: 15 }, { x: 85, y: 25 }, { x: 90, y: 50 }],
                                            map_desert: [{ x: 80, y: 20 }, { x: 50, y: 40 }, { x: 30, y: 60 }, { x: 60, y: 80 }, { x: 85, y: 60 }, { x: 70, y: 30 }, { x: 40, y: 20 }, { x: 20, y: 40 }, { x: 15, y: 70 }, { x: 40, y: 90 }, { x: 75, y: 90 }, { x: 90, y: 75 }, { x: 95, y: 45 }, { x: 65, y: 15 }, { x: 30, y: 10 }, { x: 10, y: 30 }, { x: 45, y: 50 }],
                                            map_foret: [{ x: 20, y: 20 }, { x: 40, y: 40 }, { x: 25, y: 70 }, { x: 60, y: 75 }, { x: 80, y: 50 }, { x: 70, y: 25 }, { x: 90, y: 20 }, { x: 95, y: 45 }, { x: 90, y: 75 }, { x: 70, y: 95 }, { x: 40, y: 95 }, { x: 15, y: 85 }, { x: 10, y: 55 }, { x: 30, y: 25 }, { x: 50, y: 15 }, { x: 80, y: 10 }, { x: 55, y: 30 }],
                                            map_plage: [{ x: 50, y: 85 }, { x: 25, y: 65 }, { x: 35, y: 35 }, { x: 65, y: 30 }, { x: 80, y: 60 }, { x: 60, y: 75 }, { x: 80, y: 85 }, { x: 95, y: 65 }, { x: 90, y: 35 }, { x: 75, y: 15 }, { x: 45, y: 10 }, { x: 15, y: 25 }, { x: 10, y: 55 }, { x: 20, y: 80 }, { x: 40, y: 95 }, { x: 15, y: 45 }, { x: 60, y: 50 }]
                                        };
                                        const layout = MapLayouts[currentMap] || MapLayouts.map_general;
                                        const point = layout[idx % layout.length];
                                        const currentIdx = gameStateData?.team?.currentStageIndex || 0;
                                        const isCompleted = idx < currentIdx;
                                        const isCurrent = idx === currentIdx && gameState !== 'completed';
                                        const isLocked = idx > currentIdx;
                                        const status = isCompleted ? 'completed' : isCurrent ? 'active' : 'locked';
                                        const left = `${point.x}%`;
                                        const top = `${point.y}%`;

                                        let IconComponent = FileText;
                                        if (stage.validationType === 'qr') IconComponent = ScanLine;
                                        if (stage.validationType === 'nfc') IconComponent = Wifi;
                                        if (stage.validationType === 'choice') IconComponent = Lightbulb;
                                        if (stage.validationType === 'puzzle') IconComponent = Puzzle;
                                        if (stage.validationType === 'taquin') IconComponent = LayoutGrid;
                                        if (isLocked) IconComponent = Lock;

                                        return (
                                            <div key={idx} className={styles.mapNodeWrapper} style={{ left, top, zIndex: 10 }}>
                                                <div className={styles.mapNodeIcon} data-status={status}>
                                                    <IconComponent size={20} />
                                                </div>
                                                <div className={styles.mapNodeLabel} data-status={status}>
                                                    {stage.title}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className={styles.missionListPanel}>
                                <div className={styles.missionListTitle}>{t('missionListTitle') || 'Liste des missions'}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {gameStateData?.stagesSummary?.map((stage, idx) => {
                                        const currentIdx = gameStateData?.team?.currentStageIndex || 0;
                                        const isCompleted = idx < currentIdx;
                                        const isCurrent = idx === currentIdx && gameState !== 'completed';
                                        const status = isCompleted ? 'completed' : isCurrent ? 'active' : 'locked';

                                        let IconComponent = FileText;
                                        if (stage.validationType === 'qr') IconComponent = ScanLine;
                                        if (stage.validationType === 'nfc') IconComponent = Wifi;
                                        if (stage.validationType === 'choice') IconComponent = Lightbulb;
                                        if (stage.validationType === 'puzzle') IconComponent = Puzzle;
                                        if (stage.validationType === 'taquin') IconComponent = LayoutGrid;
                                        if (status === 'locked') IconComponent = Lock;

                                        return (
                                            <div key={idx} className={styles.missionCard} data-status={status}>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '50%', background: '#131922',
                                                    border: `1px solid ${isCompleted ? '#00e599' : isCurrent ? '#00f0ff' : '#a67c52'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: isCompleted ? '#00e599' : isCurrent ? '#00f0ff' : '#a67c52'
                                                }}>
                                                    <IconComponent size={18} />
                                                </div>
                                                <div style={{ flex: 1, textAlign: language === 'ar' ? 'right' : 'left' }}>
                                                    <div style={{ fontSize: '0.9rem', color: isCurrent ? '#00f0ff' : '#fff' }}>{stage.title}</div>
                                                    <div style={{ fontSize: '0.7rem', color: status === 'locked' ? '#a67c52' : status === 'active' ? '#00f0ff' : '#00e599', textTransform: 'capitalize', fontFamily: 'Orbitron' }}>
                                                        {t(`${status}Text`) || status}
                                                    </div>
                                                </div>
                                                {isCompleted && <CheckCircle2 size={16} color="#00e599" />}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {gameState === 'playing' && activeTab === 'pvp' && gameStateData.pvp?.enabled && (
                        <div className={styles.actionPanel}>
                            <h2 style={{color: '#ff4444', fontFamily: 'Orbitron', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}><ShieldAlert /> SONDAGE DE SABOTAGE</h2>
                            <p style={{color: '#94a3b8', fontSize: '0.95rem', textAlign: 'center', marginBottom: '15px', fontFamily: 'Rajdhani'}}>
                                Votez pour paralyser un adversaire. Si {gameStateData.pvp.rescuesNeeded + 1} membres de différentes équipes ciblent la même personne dans les 5 minutes, elle sera éliminée temporairement !
                            </p>

                            <div style={{display: 'flex', justifyContent: 'center', marginBottom: '25px'}}>
                                <button 
                                    onClick={() => setShowQrReader(true)}
                                    style={{background: 'linear-gradient(45deg, #00e599, #00b377)', border: 'none', padding: '12px 24px', borderRadius: '30px', color: '#000', fontWeight: 'bold', fontFamily: 'Orbitron', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 0 15px rgba(0, 229, 153, 0.4)'}}
                                >
                                    <ScanLine size={18} /> SCANNER UN ALLIÉ
                                </button>
                            </div>

                            {showQrReader && activeTab === 'pvp' && (
                                <div style={{marginBottom: '20px'}}>
                                    <SarabQrReader 
                                        t={t}
                                        onCancel={() => setShowQrReader(false)} 
                                        onScanSuccess={(decodedText) => {
                                            setShowQrReader(false);
                                            submitNfcAnswer(decodedText);
                                        }} 
                                    />
                                </div>
                            )}

                            {message.text && (
                                <div style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', letterSpacing: '1px' }} className={message.type === 'success' ? styles.messageSuccess : styles.messageError}>
                                    {message.text}
                                </div>
                            )}

                            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                                {gameStateData.pvp.enemies.map(enemyTeam => (
                                    <div key={enemyTeam.teamId} style={{background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '15px', borderLeft: '3px solid #ff4444'}}>
                                        <div style={{color: '#fff', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '15px', fontFamily: 'Rajdhani', borderBottom: '1px solid rgba(255,68,68,0.3)', paddingBottom: '5px'}}>{enemyTeam.teamName}</div>
                                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                                            {enemyTeam.members.map(member => (
                                                <button 
                                                    key={member.id}
                                                    onClick={() => castPvPVote(member.id)}
                                                    disabled={member.isDanger}
                                                    style={{
                                                        background: (member.isDanger || member.isEliminated) ? 'rgba(255,0,0,0.2)' : 'rgba(0,0,0,0.3)',
                                                        border: (member.isDanger || member.isEliminated) ? '1px solid #ff0000' : '1px solid #334155',
                                                        color: (member.isDanger || member.isEliminated) ? '#ff0000' : '#00f0ff',
                                                        padding: '12px 10px',
                                                        borderRadius: '6px',
                                                        cursor: (member.isDanger || member.isEliminated) ? 'not-allowed' : 'pointer',
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden',
                                                        transition: 'all 0.2s',
                                                        opacity: member.isEliminated ? 0.5 : 1
                                                    }}
                                                >
                                                    <div style={{position: 'absolute', bottom: 0, left: 0, height: '4px', background: '#ff4444', width: `${member.votesPercent}%`, transition: 'width 0.3s'}}></div>
                                                    <span style={{fontFamily: 'Rajdhani', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px'}}>{member.label}</span>
                                                    <span style={{fontSize: '0.8rem', color: '#94a3b8'}}>{member.isEliminated ? 'MORT 💀' : member.isDanger ? 'EN DANGER 💀' : `Menace: ${member.votesPercent}%`}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>

                {/* Bottom Dock */}
                <nav className={styles.dock} style={{ flexDirection: language === 'ar' ? 'row-reverse' : 'row' }}>
                    <button className={`${styles.dockItem} ${activeTab === 'map' ? styles.active : ''}`} onClick={() => setActiveTab('map')}>
                        <Map className={styles.dockIcon} />
                        <span className={styles.dockLabel}>{t('dockMap')}</span>
                    </button>
                    {gameStateData?.pvp?.myThreatStatus !== 'eliminated' && (
                        <button className={`${styles.dockItem} ${activeTab === 'clues' ? styles.active : ''}`} onClick={() => setActiveTab('clues')}>
                            <Lightbulb className={styles.dockIcon} />
                            <span className={styles.dockLabel}>{t('dockClues')}</span>
                        </button>
                    )}
                    <button className={`${styles.dockItem} ${activeTab === 'leaderboard' ? styles.active : ''}`} onClick={() => setActiveTab('leaderboard')}>
                        <Trophy className={styles.dockIcon} />
                        <span className={styles.dockLabel}>{t('dockRanking')}</span>
                    </button>
                    {(gameStateData?.pvp?.enabled && gameStateData?.pvp?.myThreatStatus !== 'eliminated') && (
                        <button className={`${styles.dockItem} ${activeTab === 'pvp' ? styles.active : ''}`} onClick={() => setActiveTab('pvp')}>
                            <ShieldAlert className={styles.dockIcon} style={{ color: activeTab === 'pvp' ? '#ff4444' : undefined }} />
                            <span className={styles.dockLabel} style={{ color: activeTab === 'pvp' ? '#ff4444' : undefined }}>Anti-Jeu</span>
                        </button>
                    )}
                    <button className={styles.dockItem} onClick={handleLogout} style={{ opacity: 0.7 }}>
                        <LogOut className={styles.dockIcon} />
                        <span className={styles.dockLabel}>{t('dockLogout')}</span>
                    </button>
                </nav>
            </div>
            )}
        </div>
    );
}
