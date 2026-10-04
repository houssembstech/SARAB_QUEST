'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#131922',
      color: '#fff',
      fontFamily: 'var(--font-orbitron), sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <Image 
        src="/images/logo_games5-.png" 
        alt="Sarab Quest Logo" 
        width={300} 
        height={150} 
        style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.5))', maxWidth: '100%', width: 'auto', height: 'auto' }} 
        priority
      />
      <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', color: '#00f0ff', marginBottom: '1rem', textShadow: '0 0 10px rgba(0, 240, 255, 0.5)', marginTop: '20px' }}>
        SARAB QUEST
      </h1>
      <p style={{ fontFamily: 'var(--font-rajdhani), sans-serif', fontSize: '1.2rem', marginBottom: '2.5rem', color: '#a67c52' }}>
        Interface de lancement du projet
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '350px' }}>
        <Link href="/games/sarab-quest" style={{ textDecoration: 'none', width: '100%' }}>
          <button style={{
            width: '100%',
            padding: '15px 20px',
            fontSize: '1rem',
            fontFamily: 'var(--font-orbitron), sans-serif',
            backgroundColor: 'transparent',
            color: '#ff9900',
            border: '2px solid #ff9900',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 15px rgba(255, 153, 0, 0.2)'
          }}
          onMouseOver={(e) => { e.target.style.backgroundColor = 'rgba(255, 153, 0, 0.1)'; }}
          onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; }}
          >
            🕹️ Mode Joueur
          </button>
        </Link>
        
        <Link href="/dashboard/games/sarab-quest" style={{ textDecoration: 'none', width: '100%' }}>
          <button style={{
            width: '100%',
            padding: '15px 20px',
            fontSize: '1rem',
            fontFamily: 'var(--font-orbitron), sans-serif',
            backgroundColor: 'rgba(0, 240, 255, 0.1)',
            color: '#00f0ff',
            border: '2px solid #00f0ff',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)'
          }}
          onMouseOver={(e) => { e.target.style.backgroundColor = 'rgba(0, 240, 255, 0.2)'; }}
          onMouseOut={(e) => { e.target.style.backgroundColor = 'rgba(0, 240, 255, 0.1)'; }}
          >
            ⚙️ Dashboard Admin
          </button>
        </Link>
      </div>
    </div>
  );
}
