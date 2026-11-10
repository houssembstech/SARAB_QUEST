'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && (data.authenticated !== false) && (data.role || data.user)) {
          const role = data.role || data.user?.role || 'creator';
          const name = data.name || data.user?.name || data.email || data.user?.email || (role === 'admin' ? 'Administrateur' : 'Organisateur');
          setUser({ name, role });
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.reload();
    }
  };

  const isAdmin = user && (user.role === 'admin' || user.role === 'director');
  const isCreator = user && user.role === 'creator';
  const isAuthenticated = Boolean(user);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#131922',
      backgroundImage: 'radial-gradient(circle at 50% 15%, rgba(0, 240, 255, 0.07) 0%, transparent 60%), radial-gradient(circle at 80% 85%, rgba(166, 124, 82, 0.05) 0%, transparent 50%)',
      color: '#fff',
      fontFamily: 'var(--font-orbitron), sans-serif',
      padding: '30px 20px',
      textAlign: 'center',
      boxSizing: 'border-box'
    }}>
      {/* Logo */}
      <Image 
        src="/images/logo_games5-.png" 
        alt="Sarab Quest Logo" 
        width={300} 
        height={150} 
        style={{
          objectFit: 'contain',
          filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.5))',
          maxWidth: '100%',
          width: 'auto',
          height: 'auto'
        }} 
        priority
      />

      {/* Main Title */}
      <h1 style={{
        fontSize: 'clamp(2rem, 8vw, 3rem)',
        color: '#00f0ff',
        marginBottom: '0.5rem',
        textShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
        marginTop: '20px',
        letterSpacing: '2px'
      }}>
        SARAB QUEST
      </h1>

      {/* Subtitle */}
      <p style={{
        fontFamily: 'var(--font-rajdhani), sans-serif',
        fontSize: '1.2rem',
        marginBottom: isAuthenticated ? '1rem' : '2.5rem',
        color: '#a67c52',
        letterSpacing: '1px'
      }}>
        Interface de lancement du projet
      </p>

      {/* Authenticated user indicator badge */}
      {isAuthenticated && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(0, 229, 153, 0.08)',
          border: '1px solid rgba(0, 229, 153, 0.3)',
          borderRadius: '20px',
          padding: '6px 16px',
          marginBottom: '2rem',
          fontFamily: 'var(--font-rajdhani), sans-serif',
          fontSize: '0.95rem',
          color: '#e2e8f0',
          boxShadow: '0 0 15px rgba(0, 229, 153, 0.15)'
        }}>
          <span style={{ color: '#00e599' }}>●</span>
          <span>Connecté en tant que:</span>
          <strong style={{ color: '#fff', fontWeight: 700 }}>{user.name}</strong>
          <span style={{ color: '#ffb74d', fontFamily: 'var(--font-orbitron), sans-serif', fontSize: '0.8rem', textTransform: 'uppercase' }}>
            ({user.role})
          </span>
        </div>
      )}

      {/* Navigation Buttons Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '360px'
      }}>
        {/* 1. Mode Joueur (ALWAYS visible) */}
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
            boxShadow: '0 0 15px rgba(255, 153, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 153, 0, 0.15)'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            🕹️ Mode Joueur
          </button>
        </Link>
        
        {/* Loading state placeholder to prevent content jumping */}
        {loading && (
          <div style={{
            padding: '14px',
            fontFamily: 'var(--font-rajdhani), sans-serif',
            fontSize: '0.95rem',
            color: '#64748b'
          }}>
            Synchronisation de session...
          </div>
        )}

        {/* 2 & 3. Admin: Dashboard Admin and Gestion des Comptes */}
        {!loading && isAdmin && (
          <>
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
                boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.2)'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.1)'; }}
              >
                ⚙️ Dashboard Admin
              </button>
            </Link>

            <Link href="/dashboard/accounts" style={{ textDecoration: 'none', width: '100%' }}>
              <button style={{
                width: '100%',
                padding: '15px 20px',
                fontSize: '1rem',
                fontFamily: 'var(--font-orbitron), sans-serif',
                backgroundColor: 'rgba(0, 240, 255, 0.08)',
                color: '#00f0ff',
                border: '2px solid #00f0ff',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.2)'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.08)'; }}
              >
                👥 Gestion des Comptes
              </button>
            </Link>
          </>
        )}

        {/* 4. Creator: Mes Missions */}
        {!loading && isCreator && (
          <Link href="/dashboard/creator" style={{ textDecoration: 'none', width: '100%' }}>
            <button style={{
              width: '100%',
              padding: '15px 20px',
              fontSize: '1rem',
              fontFamily: 'var(--font-orbitron), sans-serif',
              backgroundColor: 'rgba(0, 229, 153, 0.1)',
              color: '#00e599',
              border: '2px solid #00e599',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 0 15px rgba(0, 229, 153, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0, 229, 153, 0.2)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0, 229, 153, 0.1)'; }}
            >
              🎮 Mes Missions
            </button>
          </Link>
        )}

        {/* 5. Not Authenticated: Espace Organisateur */}
        {!loading && !isAuthenticated && (
          <Link href="/auth/login" style={{ textDecoration: 'none', width: '100%' }}>
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
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.2)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.1)'; }}
            >
              🔐 Espace Organisateur
            </button>
          </Link>
        )}

        {/* 6. Authenticated: Se Déconnecter */}
        {!loading && isAuthenticated && (
          <button 
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: '100%',
              padding: '12px 20px',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-orbitron), sans-serif',
              backgroundColor: 'transparent',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.6)',
              borderRadius: '5px',
              cursor: loggingOut ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '6px'
            }}
            onMouseOver={(e) => { 
              if (!loggingOut) {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'; 
                e.currentTarget.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.25)';
              }
            }}
            onMouseOut={(e) => { 
              if (!loggingOut) {
                e.currentTarget.style.backgroundColor = 'transparent'; 
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            🚪 {loggingOut ? 'Déconnexion...' : 'Se Déconnecter'}
          </button>
        )}
      </div>
    </div>
  );
}
