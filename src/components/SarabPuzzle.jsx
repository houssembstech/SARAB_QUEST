import React, { useState, useEffect } from 'react';

export default function SarabPuzzle({ stage, onSolve, t }) {
    const { puzzleImage, puzzleGridSize, clueText } = stage || {};
    const gridSize = puzzleGridSize || 3;
    const totalPieces = gridSize * gridSize;

    const [pieces, setPieces] = useState([]);
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [isSolved, setIsSolved] = useState(false);
    const [imageRatio, setImageRatio] = useState(1);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageLoaded(false);
        setImageError(false);

        // Load aspect ratio
        if (typeof window !== 'undefined' && puzzleImage) {
            const img = new window.Image();
            img.onload = () => {
                if (img.height > 0) {
                    setImageRatio(img.width / img.height);
                }
                setImageLoaded(true);
            };
            img.onerror = () => {
                setImageError(true);
            };
            img.src = puzzleImage;
        }

        // Initialize and shuffle (ensure not solved initially)
        let initialPieces = Array.from({ length: totalPieces }, (_, i) => i);
        let isShuffled = false;
        let attempts = 0;
        while (!isShuffled && attempts < 10) {
            for (let i = initialPieces.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [initialPieces[i], initialPieces[j]] = [initialPieces[j], initialPieces[i]];
            }
            isShuffled = initialPieces.some((val, i) => val !== i);
            attempts++;
        }
        setPieces(initialPieces);
        setIsSolved(false);
        setSelectedIdx(null);
    }, [puzzleImage, puzzleGridSize, totalPieces]);

    const handlePieceClick = (index) => {
        if (isSolved) return;

        if (selectedIdx === null) {
            setSelectedIdx(index);
        } else {
            // Swap
            if (selectedIdx !== index) {
                const newPieces = [...pieces];
                const temp = newPieces[selectedIdx];
                newPieces[selectedIdx] = newPieces[index];
                newPieces[index] = temp;
                setPieces(newPieces);

                // Check win
                const win = newPieces.every((val, i) => val === i);
                if (win) {
                    setIsSolved(true);
                }
            }
            setSelectedIdx(null);
        }
    };

    if (!puzzleImage || imageError) {
        return (
            <div style={{
                padding: '25px 20px',
                textAlign: 'center',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                color: '#ef4444',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '1.05rem',
                margin: '15px 0',
                width: '100%',
                maxWidth: '350px'
            }}>
                ⚠️ Photo du puzzle non disponible ou inaccessible.
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>
                    Vérifiez que l'administrateur a bien importé l'image dans l'étape.
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
            {!isSolved ? (
                <>
                    <h3 style={{ fontFamily: 'Orbitron', color: '#00e5ff', fontSize: '1.1rem', marginBottom: '15px', letterSpacing: '1px' }}>
                        🧩 {t('puzzleBtn') || 'Puzzle Photo'}
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                        gap: '3px',
                        width: '100%',
                        maxWidth: '350px',
                        aspectRatio: `${imageRatio || 1}`,
                        minHeight: '260px',
                        background: '#1a110b',
                        padding: '6px',
                        borderRadius: '10px',
                        boxShadow: '0 0 20px rgba(0, 229, 255, 0.25)',
                        border: '1px solid rgba(0, 229, 255, 0.3)',
                        boxSizing: 'border-box'
                    }}>
                        {pieces.map((originalIndex, currentIndex) => {
                            // Calculate position for background
                            const row = Math.floor(originalIndex / gridSize);
                            const col = originalIndex % gridSize;
                            
                            const bgPosX = gridSize > 1 ? (col / (gridSize - 1)) * 100 : 0;
                            const bgPosY = gridSize > 1 ? (row / (gridSize - 1)) * 100 : 0;

                            const isSelected = selectedIdx === currentIndex;

                            return (
                                <div
                                    key={currentIndex}
                                    onClick={() => handlePieceClick(currentIndex)}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        minHeight: '40px',
                                        aspectRatio: '1',
                                        backgroundImage: `url("${puzzleImage}")`,
                                        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                                        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                                        backgroundRepeat: 'no-repeat',
                                        cursor: 'pointer',
                                        boxSizing: 'border-box',
                                        border: isSelected ? '3px solid #00e5ff' : '1px solid rgba(255,255,255,0.18)',
                                        transition: 'border 0.2s, transform 0.1s',
                                        transform: isSelected ? 'scale(0.94)' : 'scale(1)',
                                        borderRadius: '4px',
                                        boxShadow: isSelected ? '0 0 10px #00e5ff' : 'none'
                                    }}
                                />
                            );
                        })}
                    </div>
                    <div style={{ marginTop: '15px', color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', fontFamily: "'Rajdhani', sans-serif" }}>
                        💡 Cliquez sur deux morceaux pour échanger leurs positions et reconstituer la photo.
                    </div>
                </>
            ) : (
                <div style={{ width: '100%', textAlign: 'center', animation: 'fadeIn 1s' }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '350px',
                        aspectRatio: `${imageRatio || 1}`,
                        minHeight: '260px',
                        margin: '0 auto 20px',
                        backgroundImage: `url("${puzzleImage}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        borderRadius: '12px',
                        border: '2px solid #00e599',
                        boxShadow: '0 0 25px rgba(0,229,153,0.45)'
                    }} />
                    
                    <h3 style={{ color: '#00e599', fontFamily: 'Orbitron', fontSize: '1.2rem', marginBottom: '10px' }}>
                        🎉 {t('solvedPuzzleText') || "Puzzle Résolu ! Voici l'indice :"}
                    </h3>
                    
                    <div style={{ 
                        background: 'rgba(0, 229, 153, 0.1)', 
                        border: '1px solid #00e599', 
                        padding: '15px', 
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '1.2rem',
                        marginBottom: '20px',
                        fontFamily: 'Rajdhani',
                        fontWeight: 600
                    }}>
                        {clueText}
                    </div>

                    <button 
                        onClick={onSolve}
                        style={{
                            background: 'linear-gradient(135deg, rgba(0, 229, 153, 0.8) 0%, rgba(0, 150, 0, 0.6) 100%)',
                            border: '1px solid #00e599',
                            color: '#fff',
                            padding: '14px 25px',
                            fontFamily: 'Orbitron',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            boxShadow: '0 0 15px rgba(0,229,153,0.3)',
                            letterSpacing: '1px'
                        }}
                    >
                        {t('continueBtn') || "Valider et passer à l'étape suivante"}
                    </button>
                </div>
            )}
        </div>
    );
}
