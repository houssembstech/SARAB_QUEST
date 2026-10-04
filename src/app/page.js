'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function LandingPoster() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: '#05070a',
      color: '#fff',
      paddingBottom: '40px',
      position: 'relative'
    }}>
      {/* Container pour l'affiche */}
      <div style={{
        position: 'relative',
        display: 'inline-block',
        maxWidth: '100%',
        marginBottom: '20px',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0, 240, 255, 0.15)'
      }}>
        <img 
          src="/images/affiche game.jpg" 
          alt="Affiche Sarab Quest" 
          style={{ 
            display: 'block',
            width: 'auto', 
            height: 'auto', 
            maxWidth: '100%', 
            maxHeight: '75vh', 
            objectFit: 'contain' 
          }} 
        />
        
        {/* Gradient superposé pour lisibilité du bouton s'il était dessus */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100px',
          background: 'linear-gradient(to top, #05070a 0%, transparent 100%)',
          pointerEvents: 'none'
        }}></div>
      </div>

      {/* Groupe de boutons d'action */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '15px', 
        width: '100%', 
        maxWidth: '350px', 
        padding: '0 20px',
        position: 'relative',
        zIndex: 10
      }}>
        <div onClick={() => alert("Installation de l'application :\n\n- Sur iPhone (Safari) : Touchez l'icône « Partager » 📤 en bas, puis choisissez « Sur l'écran d'accueil ».\n- Sur Android (Chrome) : Le navigateur vous proposera automatiquement d'installer l'application d'ici quelques secondes, ou utilisez le menu en haut à droite ⠇ puis « Ajouter à l'écran d'accueil ».")}>
          <button style={{
            width: '100%',
            padding: '18px 20px',
            fontSize: '1.2rem',
            fontFamily: 'var(--font-orbitron), sans-serif',
            backgroundColor: 'rgba(0, 240, 255, 0.1)',
            color: '#00f0ff',
            border: '2px solid #00f0ff',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
          onMouseOver={(e) => { e.target.style.backgroundColor = 'rgba(0, 240, 255, 0.2)'; e.target.style.transform = 'scale(1.02)'; }}
          onMouseOut={(e) => { e.target.style.backgroundColor = 'rgba(0, 240, 255, 0.1)'; e.target.style.transform = 'scale(1)'; }}
          >
            📱 INSTALLER LE JEU
          </button>
        </div>

        <Link href="/menu" style={{ textDecoration: 'none' }}>
          <button style={{
            width: '100%',
            padding: '12px 20px',
            fontSize: '1rem',
            fontFamily: 'var(--font-orbitron), sans-serif',
            backgroundColor: 'transparent',
            color: '#a67c52',
            border: '1px solid #a67c52',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseOver={(e) => { e.target.style.backgroundColor = 'rgba(166, 124, 82, 0.1)'; }}
          onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}
          >
            💻 Accéder Menu (Web)
          </button>
        </Link>
      </div>
    </div>
  );
}
