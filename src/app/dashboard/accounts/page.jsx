'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, ShieldCheck, Clock, Trash2, CheckCircle2, XCircle,
  ArrowRight, Shield, UserCog, UserPlus, Edit3, Lock, Ban,
  Eye, EyeOff, AlertCircle, CheckCircle, X, KeyRound
} from 'lucide-react';

// ── Modal générique ──────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '16px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1b2431 0%, #11161d 100%)',
        border: '1px solid rgba(166,124,82,0.4)',
        borderRadius: '12px', padding: '28px',
        width: '100%', maxWidth: '460px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
          <h2 style={{ fontFamily: "'Orbitron', sans-serif", color: '#00f0ff', fontSize: '1.1rem', letterSpacing: '1px', margin: 0 }}>
            {title}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Champ de formulaire ──────────────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder, icon: Icon, rightEl }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', color: '#a67c52', fontFamily: "'Orbitron', sans-serif", fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
        {label}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && <Icon size={16} color={focused ? '#00f0ff' : '#475569'} style={{ position: 'absolute', left: '12px', pointerEvents: 'none', transition: 'color 0.2s' }} />}
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#0d1117',
            border: focused ? '1px solid #00f0ff' : '1px solid rgba(0,240,255,0.2)',
            borderRadius: '8px',
            color: '#fff',
            padding: `12px ${rightEl ? '42px' : '14px'} 12px ${Icon ? '38px' : '14px'}`,
            fontFamily: "'Rajdhani', sans-serif", fontSize: '1rem',
            outline: 'none',
            boxShadow: focused ? '0 0 8px rgba(0,240,255,0.2)' : 'none',
            transition: 'all 0.2s'
          }}
        />
        {rightEl && <div style={{ position: 'absolute', right: '10px' }}>{rightEl}</div>}
      </div>
    </div>
  );
}

// ── Bouton d'action ──────────────────────────────────────────────────────────
function ActionBtn({ color, onClick, children, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: '6px 11px', borderRadius: '6px',
        border: `1px solid ${color}`,
        background: hov ? `${color}22` : 'transparent',
        color, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: '0.82rem',
        display: 'flex', alignItems: 'center', gap: '5px',
        transition: 'all 0.2s', whiteSpace: 'nowrap'
      }}
    >{children}</button>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function AccountsManagement() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null); // { msg, type: 'success'|'error' }

  // Modals
  const [editModal, setEditModal] = useState(null);   // user object
  const [addModal, setAddModal] = useState(false);

  // Edit form
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPwd, setShowEditPwd] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Add form
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState('creator');
  const [showAddPwd, setShowAddPwd] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => { checkAuth(); fetchUsers(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.authenticated || data.role !== 'admin') { router.push('/auth/login'); return; }
      setCurrentUser(data);
    } catch { router.push('/auth/login'); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/admin/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── API helpers ──────────────────────────────────────────────────────────
  const apiPut = async (body) => {
    const res = await fetch('/api/auth/admin/users', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.json();
  };

  const handleApprove = async (userId) => {
    const d = await apiPut({ userId, isApproved: true });
    if (d.success) { showToast('Compte approuvé ✓'); fetchUsers(); }
    else showToast(d.error, 'error');
  };

  const handleSuspend = async (userId) => {
    const d = await apiPut({ userId, isApproved: false });
    if (d.success) { showToast('Compte suspendu'); fetchUsers(); }
    else showToast(d.error, 'error');
  };

  const handleBlock = async (userId, currentlyBlocked) => {
    const d = await apiPut({ userId, isBlocked: !currentlyBlocked });
    if (d.success) { showToast(currentlyBlocked ? 'Compte débloqué ✓' : 'Compte bloqué 🚫'); fetchUsers(); }
    else showToast(d.error, 'error');
  };

  const handlePromoteAdmin = async (userId) => {
    if (!confirm('Promouvoir cet utilisateur en administrateur ?')) return;
    const d = await apiPut({ userId, role: 'admin', isApproved: true });
    if (d.success) { showToast('Promu administrateur ✓'); fetchUsers(); }
    else showToast(d.error, 'error');
  };

  const handleDelete = async (userId) => {
    if (!confirm('Supprimer définitivement ce compte ?')) return;
    const res = await fetch(`/api/auth/admin/users?userId=${userId}`, { method: 'DELETE' });
    const d = await res.json();
    if (d.success) { showToast('Compte supprimé'); fetchUsers(); }
    else showToast(d.error, 'error');
  };

  // ── Ouvrir modal édition ─────────────────────────────────────────────────
  const openEdit = (user) => {
    setEditModal(user);
    setEditName(user.name);
    setEditPassword('');
    setShowEditPwd(false);
  };

  const handleEditSave = async () => {
    if (!editName.trim()) { showToast('Le nom ne peut pas être vide', 'error'); return; }
    setEditLoading(true);
    const body = { userId: editModal._id, name: editName };
    if (editPassword) body.password = editPassword;
    const d = await apiPut(body);
    setEditLoading(false);
    if (d.success) { showToast('Modifications enregistrées ✓'); setEditModal(null); fetchUsers(); }
    else showToast(d.error, 'error');
  };

  // ── Ajouter un compte ────────────────────────────────────────────────────
  const handleAddSave = async () => {
    if (!addName.trim() || !addEmail.trim() || !addPassword) {
      showToast('Tous les champs sont requis', 'error'); return;
    }
    setAddLoading(true);
    const res = await fetch('/api/auth/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: addName, email: addEmail, password: addPassword, role: addRole })
    });
    const d = await res.json();
    setAddLoading(false);
    if (d.success) {
      showToast('Compte créé avec succès ✓');
      setAddModal(false);
      setAddName(''); setAddEmail(''); setAddPassword(''); setAddRole('creator');
      fetchUsers();
    } else showToast(d.error, 'error');
  };

  // ── Filtres ──────────────────────────────────────────────────────────────
  const pending = users.filter(u => !u.isApproved && u.role === 'creator' && !u.isBlocked);
  const blocked = users.filter(u => u.isBlocked);
  const filtered = filter === 'all' ? users
    : filter === 'pending' ? pending
    : filter === 'blocked' ? blocked
    : filter === 'creators' ? users.filter(u => u.role === 'creator')
    : users.filter(u => u.role === 'admin');

  // ── Styles ───────────────────────────────────────────────────────────────
  const S = {
    page: { minHeight: '100vh', backgroundColor: '#0a0f16', color: '#e2e8f0', fontFamily: "'Rajdhani', sans-serif", padding: '28px 24px' },
    backBtn: { background: 'transparent', color: '#a67c52', border: '1px solid rgba(166,124,82,0.4)', padding: '8px 14px', fontFamily: "'Orbitron', sans-serif", borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '22px', width: 'fit-content', letterSpacing: '0.5px' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '26px' },
    title: { fontFamily: "'Orbitron', sans-serif", color: '#00f0ff', fontSize: 'clamp(1.3rem, 3vw, 2rem)', textShadow: '0 0 10px rgba(0,240,255,0.4)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 },
    stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', marginBottom: '24px' },
    statCard: (c) => ({ background: '#131922', border: `1px solid ${c}33`, borderRadius: '10px', padding: '16px', textAlign: 'center' }),
    statNum: (c) => ({ fontFamily: "'Orbitron', sans-serif", fontSize: '2rem', color: c, fontWeight: 'bold', lineHeight: 1 }),
    statLbl: { fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.5px', marginTop: '6px' },
    filterBar: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
    filterBtn: (a) => ({ padding: '7px 14px', borderRadius: '20px', border: a ? '1px solid #00f0ff' : '1px solid rgba(148,163,184,0.3)', background: a ? 'rgba(0,240,255,0.12)' : 'transparent', color: a ? '#00f0ff' : '#94a3b8', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.2s' }),
    card: { background: 'linear-gradient(135deg, #1b2431 0%, #131922 100%)', border: '1px solid rgba(166,124,82,0.25)', borderRadius: '12px', overflow: 'hidden' },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: '14px', flexWrap: 'wrap' },
    badge: (t) => ({
      padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold',
      textTransform: 'uppercase', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.3px',
      ...(t === 'admin' ? { background: 'rgba(0,240,255,0.15)', color: '#00f0ff', border: '1px solid rgba(0,240,255,0.35)' }
        : t === 'creator' ? { background: 'rgba(0,229,153,0.15)', color: '#00e599', border: '1px solid rgba(0,229,153,0.35)' }
        : { background: 'rgba(255,183,77,0.15)', color: '#ffb74d', border: '1px solid rgba(255,183,77,0.35)' })
    }),
    statusBadge: (approved, blocked) => ({
      padding: '3px 9px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 'bold',
      ...(blocked ? { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }
        : approved ? { background: 'rgba(0,229,153,0.12)', color: '#00e599', border: '1px solid rgba(0,229,153,0.25)' }
        : { background: 'rgba(255,183,77,0.12)', color: '#ffb74d', border: '1px solid rgba(255,183,77,0.25)' })
    }),
    addBtn: { background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,229,153,0.15))', border: '1px solid #00f0ff', color: '#00f0ff', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Orbitron', sans-serif", fontSize: '0.82rem', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '7px', boxShadow: '0 0 12px rgba(0,240,255,0.15)' },
    submitBtn: (loading) => ({ width: '100%', padding: '13px', background: 'linear-gradient(135deg, rgba(0,240,255,0.18), rgba(0,229,153,0.18))', border: '2px solid #00f0ff', borderRadius: '8px', color: '#00f0ff', fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem', letterSpacing: '1px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }),
    selectStyle: { width: '100%', background: '#0d1117', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '8px', color: '#fff', padding: '12px 14px', fontFamily: "'Rajdhani', sans-serif", fontSize: '1rem', outline: 'none', marginBottom: '16px' },
  };

  return (
    <div style={S.page}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 10000, background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(0,229,153,0.15)', border: `1px solid ${toast.type === 'error' ? '#ef4444' : '#00e599'}`, color: toast.type === 'error' ? '#ef4444' : '#00e599', padding: '12px 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: '1rem', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Back button */}
      <button onClick={() => router.push('/dashboard/games/sarab-quest')} style={S.backBtn}>
        <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Dashboard Admin
      </button>

      {/* Header */}
      <div style={S.header}>
        <h1 style={S.title}><Users color="#00f0ff" size={28} /> Gestion des Comptes</h1>
        <button onClick={() => setAddModal(true)} style={S.addBtn}>
          <UserPlus size={16} /> Nouveau Compte
        </button>
      </div>

      {/* Stats */}
      <div style={S.stats}>
        {[
          { label: 'Total', val: users.length, color: '#00f0ff' },
          { label: 'En attente', val: pending.length, color: '#ffb74d' },
          { label: 'Créateurs', val: users.filter(u => u.role === 'creator' && u.isApproved && !u.isBlocked).length, color: '#00e599' },
          { label: 'Admins', val: users.filter(u => u.role === 'admin').length, color: '#00f0ff' },
          { label: 'Bloqués', val: blocked.length, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={S.statCard(s.color)}>
            <div style={S.statNum(s.color)}>{s.val}</div>
            <div style={S.statLbl}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={S.filterBar}>
        {[
          { key: 'all', label: `Tous (${users.length})` },
          { key: 'pending', label: `En attente (${pending.length})` },
          { key: 'creators', label: `Créateurs (${users.filter(u => u.role === 'creator').length})` },
          { key: 'admins', label: `Admins (${users.filter(u => u.role === 'admin').length})` },
          { key: 'blocked', label: `Bloqués (${blocked.length})` },
        ].map(f => (
          <button key={f.key} style={S.filterBtn(filter === f.key)} onClick={() => setFilter(f.key)}>{f.label}</button>
        ))}
      </div>

      {/* Users list */}
      <div style={S.card}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(166,124,82,0.2)', fontFamily: "'Orbitron', sans-serif", color: '#a67c52', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserCog size={16} /> Comptes ({filtered.length})
        </div>

        {loading ? (
          <p style={{ color: '#00f0ff', textAlign: 'center', padding: '32px', fontFamily: "'Orbitron', sans-serif", fontSize: '0.9rem' }}>Chargement...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#475569', textAlign: 'center', padding: '32px' }}>Aucun compte trouvé</p>
        ) : (
          filtered.map((user, i) => (
            <div key={user._id} style={{ ...S.row, background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.15)' }}>
              {/* Info */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: user.isBlocked ? '#ef4444' : '#fff' }}>{user.name}</span>
                  <span style={S.badge(user.role)}>{user.role}</span>
                  {user.role !== 'admin' && (
                    <span style={S.statusBadge(user.isApproved, user.isBlocked)}>
                      {user.isBlocked ? '🚫 Bloqué' : user.isApproved ? '✓ Approuvé' : '⏳ En attente'}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#64748b' }}>{user.email}</div>
                <div style={{ fontSize: '0.76rem', color: '#334155', marginTop: '1px' }}>
                  Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                {/* Modifier */}
                <ActionBtn color="#00f0ff" onClick={() => openEdit(user)}>
                  <Edit3 size={13} /> Modifier
                </ActionBtn>

                {/* Approuver / Suspendre (seulement pour creators non admin) */}
                {user.role === 'creator' && !user.isBlocked && !user.isApproved && (
                  <ActionBtn color="#00e599" onClick={() => handleApprove(user._id)}>
                    <CheckCircle2 size={13} /> Approuver
                  </ActionBtn>
                )}
                {user.role === 'creator' && !user.isBlocked && user.isApproved && (
                  <ActionBtn color="#ffb74d" onClick={() => handleSuspend(user._id)}>
                    <XCircle size={13} /> Suspendre
                  </ActionBtn>
                )}

                {/* Promouvoir admin */}
                {user.role === 'creator' && (
                  <ActionBtn color="#a78bfa" onClick={() => handlePromoteAdmin(user._id)}>
                    <Shield size={13} /> Admin
                  </ActionBtn>
                )}

                {/* Bloquer / Débloquer */}
                {currentUser && user._id !== currentUser.userId && (
                  <ActionBtn color={user.isBlocked ? '#00e599' : '#f97316'} onClick={() => handleBlock(user._id, user.isBlocked)}>
                    <Ban size={13} /> {user.isBlocked ? 'Débloquer' : 'Bloquer'}
                  </ActionBtn>
                )}

                {/* Supprimer */}
                {currentUser && user._id !== currentUser.userId && (
                  <ActionBtn color="#ef4444" onClick={() => handleDelete(user._id)}>
                    <Trash2 size={13} />
                  </ActionBtn>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Modal Modifier ──────────────────────────────────────────────── */}
      {editModal && (
        <Modal title={`Modifier — ${editModal.name}`} onClose={() => setEditModal(null)}>
          <Field
            label="Nom complet" value={editName}
            onChange={e => setEditName(e.target.value)}
            placeholder="Nom complet" icon={UserCog}
          />
          <Field
            label="Nouveau mot de passe (laisser vide = inchangé)"
            type={showEditPwd ? 'text' : 'password'}
            value={editPassword}
            onChange={e => setEditPassword(e.target.value)}
            placeholder="••••••••"
            icon={KeyRound}
            rightEl={
              <button type="button" onClick={() => setShowEditPwd(v => !v)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', padding: 0 }}>
                {showEditPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button onClick={() => setEditModal(null)} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid rgba(166,124,82,0.4)', borderRadius: '8px', color: '#a67c52', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>
              Annuler
            </button>
            <button onClick={handleEditSave} disabled={editLoading} style={{ ...S.submitBtn(editLoading), flex: 1, marginTop: 0 }}>
              {editLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal Ajouter ───────────────────────────────────────────────── */}
      {addModal && (
        <Modal title="Créer un Nouveau Compte" onClose={() => setAddModal(false)}>
          <Field label="Nom complet" value={addName} onChange={e => setAddName(e.target.value)} placeholder="Ex: Sarah Ben Salem" icon={UserCog} />
          <Field label="Adresse Email" type="email" value={addEmail} onChange={e => setAddEmail(e.target.value)} placeholder="email@sarab-quest.tn" icon={Lock} />
          <Field
            label="Mot de passe (6+ caractères)"
            type={showAddPwd ? 'text' : 'password'}
            value={addPassword} onChange={e => setAddPassword(e.target.value)}
            placeholder="••••••••" icon={KeyRound}
            rightEl={
              <button type="button" onClick={() => setShowAddPwd(v => !v)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', padding: 0 }}>
                {showAddPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#a67c52', fontFamily: "'Orbitron', sans-serif", fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
              Rôle
            </label>
            <select value={addRole} onChange={e => setAddRole(e.target.value)} style={S.selectStyle}>
              <option value="creator">Créateur (Organisateur)</option>
              <option value="admin">Administrateur</option>
              <option value="director">Directeur</option>
            </select>
          </div>
          <div style={{ background: 'rgba(0,229,153,0.06)', border: '1px solid rgba(0,229,153,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '0.88rem', color: '#64748b' }}>
            ✓ Le compte sera <strong style={{ color: '#00e599' }}>approuvé automatiquement</strong> (créé par admin)
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setAddModal(false)} style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid rgba(166,124,82,0.4)', borderRadius: '8px', color: '#a67c52', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>
              Annuler
            </button>
            <button onClick={handleAddSave} disabled={addLoading} style={{ ...S.submitBtn(addLoading), flex: 1, marginTop: 0 }}>
              <UserPlus size={16} /> {addLoading ? 'Création...' : 'Créer le Compte'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
