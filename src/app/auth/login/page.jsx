'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, LogIn, Clock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingApproval, setPendingApproval] = useState(false);

  // Focus states for animated input glow
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPendingApproval(false);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.error) {
        if (data.pendingApproval || data.status === 'pending' || data.error?.toLowerCase().includes('attente')) {
          setPendingApproval(true);
          setError(data.error || 'Votre compte est en attente d\'approbation par un administrateur.');
        } else {
          setError(data.error || 'Identifiants invalides. Veuillez réessayer.');
        }
        setLoading(false);
        return;
      }

      // Determine user role and redirect
      const role = data.data?.role || data.role || data.user?.role || 'creator';

      if (role === 'admin' || role === 'director') {
        router.push('/dashboard/games/sarab-quest');
      } else {
        router.push('/dashboard/creator');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Impossible de se connecter au serveur. Veuillez vérifier votre connexion.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0f16',
      backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(0, 240, 255, 0.08) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(166, 124, 82, 0.06) 0%, transparent 50%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px 16px',
      color: '#fff',
      fontFamily: 'var(--font-rajdhani), sans-serif',
      position: 'relative'
    }}>
      {/* Back to menu button */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 10
      }}>
        <Link href="/menu" style={{ textDecoration: 'none' }}>
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: '1px solid rgba(166, 124, 82, 0.4)',
              color: '#a67c52',
              padding: '8px 16px',
              borderRadius: '8px',
              fontFamily: 'var(--font-orbitron), sans-serif',
              fontSize: '0.8rem',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#00f0ff';
              e.currentTarget.style.color = '#00f0ff';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 240, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(166, 124, 82, 0.4)';
              e.currentTarget.style.color = '#a67c52';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <ArrowLeft size={16} />
            Retour Menu
          </button>
        </Link>
      </div>

      {/* Main card */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'linear-gradient(135deg, #1b2431 0%, #11161d 100%)',
        border: '1px solid rgba(166, 124, 82, 0.3)',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 240, 255, 0.03)',
        padding: '36px 30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo */}
        <Link href="/menu" style={{ display: 'inline-block', marginBottom: '16px' }}>
          <Image
            src="/images/logo_games5-.png"
            alt="SARAB Quest Logo"
            width={240}
            height={120}
            style={{
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.5))',
              maxWidth: '100%',
              width: 'auto',
              height: 'auto'
            }}
            priority
          />
        </Link>

        {/* Header titles */}
        <h1 style={{
          fontFamily: 'var(--font-orbitron), sans-serif',
          color: '#00f0ff',
          fontSize: 'clamp(1.6rem, 5vw, 2rem)',
          letterSpacing: '2px',
          textShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
          margin: '0 0 6px 0',
          textAlign: 'center',
          fontWeight: 700
        }}>
          CONNEXION
        </h1>
        <p style={{
          fontFamily: 'var(--font-rajdhani), sans-serif',
          color: '#a67c52',
          fontSize: '1.05rem',
          fontWeight: 600,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          margin: '0 0 26px 0',
          textAlign: 'center'
        }}>
          Espace Organisateur
        </p>

        {/* Pending Approval Message Banner */}
        {pendingApproval && (
          <div style={{
            width: '100%',
            color: '#ffb74d',
            background: 'rgba(255, 183, 77, 0.1)',
            border: '1px solid rgba(255, 183, 77, 0.35)',
            borderRadius: '8px',
            padding: '14px',
            marginBottom: '20px',
            fontSize: '0.95rem',
            lineHeight: 1.5,
            boxShadow: '0 0 15px rgba(255, 183, 77, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 700, fontFamily: 'var(--font-orbitron), sans-serif', fontSize: '0.85rem' }}>
              <Clock size={18} color="#ffb74d" />
              <span>COMPTE EN ATTENTE DE VALIDATION</span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              Votre compte est enregistré mais doit être approuvé par un administrateur avant de pouvoir accéder aux missions.
            </div>
            <a
              href="https://wa.me/21623468877?text=Bonjour,%20je%20souhaite%20activer%20mon%20compte%20SARAB%20Quest"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#00e599',
                background: 'rgba(0, 229, 153, 0.12)',
                border: '1px solid rgba(0, 229, 153, 0.3)',
                padding: '8px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontFamily: 'var(--font-orbitron), sans-serif',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                width: '100%',
                justifyContent: 'center',
                boxSizing: 'border-box'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(0, 229, 153, 0.22)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 229, 153, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(0, 229, 153, 0.12)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* WhatsApp SVG Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>Accélérer via WhatsApp (+216 23468877)</span>
            </a>
          </div>
        )}

        {/* Standard Error Message */}
        {error && !pendingApproval && (
          <div style={{
            width: '100%',
            color: '#ef4444',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '20px',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxSizing: 'border-box'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email field */}
          <div>
            <label style={{
              display: 'block',
              color: '#a67c52',
              fontFamily: 'var(--font-orbitron), sans-serif',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '6px'
            }}>
              Adresse Email
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="organisateur@sarab-quest.tn"
                disabled={loading}
                style={{
                  width: '100%',
                  background: '#0d1117',
                  border: emailFocused ? '1px solid #00f0ff' : '1px solid rgba(0, 240, 255, 0.2)',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '14px 14px 14px 42px',
                  fontFamily: 'var(--font-rajdhani), sans-serif',
                  fontSize: '1.05rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: emailFocused ? '0 0 10px rgba(0, 240, 255, 0.25)' : 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Mail
                size={18}
                color={emailFocused ? '#00f0ff' : '#64748b'}
                style={{
                  position: 'absolute',
                  left: '14px',
                  pointerEvents: 'none',
                  transition: 'color 0.2s ease'
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label style={{
              display: 'block',
              color: '#a67c52',
              fontFamily: 'var(--font-orbitron), sans-serif',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '6px'
            }}>
              Mot de Passe
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="••••••••••••"
                disabled={loading}
                style={{
                  width: '100%',
                  background: '#0d1117',
                  border: passwordFocused ? '1px solid #00f0ff' : '1px solid rgba(0, 240, 255, 0.2)',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '14px 46px 14px 42px',
                  fontFamily: 'var(--font-rajdhani), sans-serif',
                  fontSize: '1.05rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: passwordFocused ? '0 0 10px rgba(0, 240, 255, 0.25)' : 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Lock
                size={18}
                color={passwordFocused ? '#00f0ff' : '#64748b'}
                style={{
                  position: 'absolute',
                  left: '14px',
                  pointerEvents: 'none',
                  transition: 'color 0.2s ease'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 20px',
              marginTop: '8px',
              fontFamily: 'var(--font-orbitron), sans-serif',
              fontSize: '1rem',
              letterSpacing: '1px',
              fontWeight: 700,
              color: '#00f0ff',
              background: 'linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(0,229,153,0.15) 100%)',
              border: '2px solid #00f0ff',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,240,255,0.3) 0%, rgba(0,229,153,0.3) 100%)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 240, 255, 0.45)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(0,229,153,0.15) 100%)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.2)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <LogIn size={18} />
            <span>{loading ? 'Connexion en cours...' : 'Se Connecter'}</span>
          </button>
        </form>

        {/* Divider */}
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          margin: '24px 0 18px 0',
          gap: '12px'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(166, 124, 82, 0.25)' }} />
          <span style={{
            fontFamily: 'var(--font-orbitron), sans-serif',
            fontSize: '0.75rem',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Nouveau Créateur ?
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(166, 124, 82, 0.25)' }} />
        </div>

        {/* Register link */}
        <Link href="/auth/register" style={{ textDecoration: 'none', width: '100%' }}>
          <button
            style={{
              width: '100%',
              padding: '12px 18px',
              fontFamily: 'var(--font-rajdhani), sans-serif',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#ffb74d',
              background: 'transparent',
              border: '1px solid rgba(255, 183, 77, 0.4)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 183, 77, 0.1)';
              e.currentTarget.style.borderColor = '#ffb74d';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 183, 77, 0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255, 183, 77, 0.4)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Créer un Compte Organisateur →
          </button>
        </Link>
      </div>

      {/* Footer copyright */}
      <div style={{
        marginTop: '24px',
        color: '#475569',
        fontSize: '0.85rem',
        fontFamily: 'var(--font-rajdhani), sans-serif',
        textAlign: 'center'
      }}>
        SARAB QUEST • Système d'Authentification Sécurisé
      </div>
    </div>
  );
}
