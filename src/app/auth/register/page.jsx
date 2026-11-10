'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft, UserPlus, LogIn } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Focus states for input styling
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!name.trim() || !email.trim() || !password) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.error) {
        setError(data.error || 'Une erreur est survenue lors de l\'inscription.');
        setLoading(false);
        return;
      }

      // Success: switch to success panel
      setIsSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Impossible de communiquer avec le serveur. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0f16',
      backgroundImage: 'radial-gradient(circle at 50% 15%, rgba(0, 240, 255, 0.08) 0%, transparent 60%), radial-gradient(circle at 20% 85%, rgba(0, 229, 153, 0.05) 0%, transparent 50%)',
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

      {/* Main Container Card */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
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

        {/* ── SUCCESS STATE PANEL ────────────────────────────────────────── */}
        {isSuccess ? (
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '10px 0'
          }}>
            <div style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              background: 'rgba(0, 229, 153, 0.12)',
              border: '2px solid #00e599',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              boxShadow: '0 0 30px rgba(0, 229, 153, 0.35)'
            }}>
              <CheckCircle size={44} color="#00e599" />
            </div>

            <h2 style={{
              fontFamily: 'var(--font-orbitron), sans-serif',
              color: '#00e599',
              fontSize: '1.6rem',
              letterSpacing: '1px',
              textShadow: '0 0 12px rgba(0, 229, 153, 0.5)',
              margin: '0 0 14px 0'
            }}>
              Inscription Réussie !
            </h2>

            <div style={{
              background: 'rgba(0, 229, 153, 0.06)',
              border: '1px solid rgba(0, 229, 153, 0.25)',
              borderRadius: '10px',
              padding: '16px 18px',
              marginBottom: '22px',
              color: '#e2e8f0',
              fontSize: '1.05rem',
              lineHeight: 1.6
            }}>
              Votre compte organisateur a été créé avec succès. Il est actuellement <strong style={{ color: '#ffb74d' }}>en attente d'approbation</strong> par l'administrateur de SARAB Quest.
            </div>

            {/* WhatsApp Contact Box */}
            <div style={{
              width: '100%',
              background: 'rgba(255, 183, 77, 0.08)',
              border: '1px solid rgba(255, 183, 77, 0.3)',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '26px',
              boxSizing: 'border-box'
            }}>
              <p style={{
                color: '#ffb74d',
                fontFamily: 'var(--font-rajdhani), sans-serif',
                fontSize: '0.98rem',
                margin: '0 0 12px 0',
                lineHeight: 1.5
              }}>
                En cas de retard, contactez-nous par WhatsApp :
              </p>
              <a
                href="https://wa.me/21623468877?text=Bonjour,%20je%20viens%20de%20créer%20mon%20compte%20SARAB%20Quest%20avec%20l'email:%20"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  color: '#00e599',
                  background: 'rgba(0, 229, 153, 0.15)',
                  border: '1px solid #00e599',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-orbitron), sans-serif',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 229, 153, 0.28)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 229, 153, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 229, 153, 0.15)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* WhatsApp SVG Icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>+216 23468877</span>
              </a>
            </div>

            {/* Go to Login Button */}
            <Link href="/auth/login" style={{ textDecoration: 'none', width: '100%' }}>
              <button
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontFamily: 'var(--font-orbitron), sans-serif',
                  fontSize: '0.95rem',
                  letterSpacing: '1px',
                  fontWeight: 700,
                  color: '#00f0ff',
                  background: 'linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(0,229,153,0.15) 100%)',
                  border: '2px solid #00f0ff',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 0 15px rgba(0, 240, 255, 0.25)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,240,255,0.3) 0%, rgba(0,229,153,0.3) 100%)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 240, 255, 0.45)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(0,229,153,0.15) 100%)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.25)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <LogIn size={18} />
                <span>Aller à la Page de Connexion</span>
              </button>
            </Link>
          </div>
        ) : (
          /* ── REGISTRATION FORM ────────────────────────────────────────── */
          <>
            <h1 style={{
              fontFamily: 'var(--font-orbitron), sans-serif',
              color: '#00f0ff',
              fontSize: 'clamp(1.4rem, 4.5vw, 1.8rem)',
              letterSpacing: '1.5px',
              textShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
              margin: '0 0 6px 0',
              textAlign: 'center',
              fontWeight: 700
            }}>
              Créer un Compte Organisateur
            </h1>
            <p style={{
              fontFamily: 'var(--font-rajdhani), sans-serif',
              color: '#a67c52',
              fontSize: '1rem',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              margin: '0 0 24px 0',
              textAlign: 'center'
            }}>
              Rejoignez l'équipe des créateurs SARAB Quest
            </p>

            {/* Error Message */}
            {error && (
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

            <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Full Name */}
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
                  Nom Complet
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Ex: Sarah Ben Salem"
                    disabled={loading}
                    style={{
                      width: '100%',
                      background: '#0d1117',
                      border: focusedField === 'name' ? '1px solid #00f0ff' : '1px solid rgba(0, 240, 255, 0.2)',
                      color: '#fff',
                      borderRadius: '8px',
                      padding: '14px 14px 14px 42px',
                      fontFamily: 'var(--font-rajdhani), sans-serif',
                      fontSize: '1.05rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      boxShadow: focusedField === 'name' ? '0 0 10px rgba(0, 240, 255, 0.25)' : 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <User
                    size={18}
                    color={focusedField === 'name' ? '#00f0ff' : '#64748b'}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      pointerEvents: 'none',
                      transition: 'color 0.2s ease'
                    }}
                  />
                </div>
              </div>

              {/* Email */}
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
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="organisateur@sarab-quest.tn"
                    disabled={loading}
                    style={{
                      width: '100%',
                      background: '#0d1117',
                      border: focusedField === 'email' ? '1px solid #00f0ff' : '1px solid rgba(0, 240, 255, 0.2)',
                      color: '#fff',
                      borderRadius: '8px',
                      padding: '14px 14px 14px 42px',
                      fontFamily: 'var(--font-rajdhani), sans-serif',
                      fontSize: '1.05rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      boxShadow: focusedField === 'email' ? '0 0 10px rgba(0, 240, 255, 0.25)' : 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Mail
                    size={18}
                    color={focusedField === 'email' ? '#00f0ff' : '#64748b'}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      pointerEvents: 'none',
                      transition: 'color 0.2s ease'
                    }}
                  />
                </div>
              </div>

              {/* Password */}
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
                  Mot de Passe (6+ caractères)
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••••••"
                    disabled={loading}
                    style={{
                      width: '100%',
                      background: '#0d1117',
                      border: focusedField === 'password' ? '1px solid #00f0ff' : '1px solid rgba(0, 240, 255, 0.2)',
                      color: '#fff',
                      borderRadius: '8px',
                      padding: '14px 46px 14px 42px',
                      fontFamily: 'var(--font-rajdhani), sans-serif',
                      fontSize: '1.05rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      boxShadow: focusedField === 'password' ? '0 0 10px rgba(0, 240, 255, 0.25)' : 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Lock
                    size={18}
                    color={focusedField === 'password' ? '#00f0ff' : '#64748b'}
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

              {/* Confirm Password */}
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
                  Confirmer le Mot de Passe
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••••••"
                    disabled={loading}
                    style={{
                      width: '100%',
                      background: '#0d1117',
                      border: focusedField === 'confirmPassword' ? '1px solid #00f0ff' : '1px solid rgba(0, 240, 255, 0.2)',
                      color: '#fff',
                      borderRadius: '8px',
                      padding: '14px 46px 14px 42px',
                      fontFamily: 'var(--font-rajdhani), sans-serif',
                      fontSize: '1.05rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      boxShadow: focusedField === 'confirmPassword' ? '0 0 10px rgba(0, 240, 255, 0.25)' : 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Lock
                    size={18}
                    color={focusedField === 'confirmPassword' ? '#00f0ff' : '#64748b'}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      pointerEvents: 'none',
                      transition: 'color 0.2s ease'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    {showConfirmPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  marginTop: '10px',
                  fontFamily: 'var(--font-orbitron), sans-serif',
                  fontSize: '0.95rem',
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
                <UserPlus size={18} />
                <span>{loading ? 'Création en cours...' : 'Créer Mon Compte'}</span>
              </button>
            </form>

            {/* Divider */}
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              margin: '22px 0 16px 0',
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
                Déjà Inscrit ?
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(166, 124, 82, 0.25)' }} />
            </div>

            {/* Login Link */}
            <Link href="/auth/login" style={{ textDecoration: 'none', width: '100%' }}>
              <button
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  fontFamily: 'var(--font-rajdhani), sans-serif',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#00f0ff',
                  background: 'transparent',
                  border: '1px solid rgba(0, 240, 255, 0.35)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)';
                  e.currentTarget.style.borderColor = '#00f0ff';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.25)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.35)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Se Connecter à un Compte Existant →
              </button>
            </Link>
          </>
        )}
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
