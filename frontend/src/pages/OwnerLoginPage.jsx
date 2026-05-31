import { useState } from 'react'
import { ownerLogin, managerLogin } from '../api/fleetApi'

export default function OwnerLoginPage({ onOwnerSuccess, onManagerSuccess, onBack }) {
  const [mode, setMode] = useState('owner') // 'owner' or 'manager'
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setLoading(true); setError('')
    try {
      if (mode === 'owner') {
        if (!password.trim()) { setError('Enter password'); setLoading(false); return }
        await ownerLogin(password)
        onOwnerSuccess()
      } else {
        if (!username.trim() || !password.trim()) { setError('Enter username and password'); setLoading(false); return }
        const data = await managerLogin(username, password)
        onManagerSuccess(data.manager)
      }
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#020B18',
      backgroundImage: `
        linear-gradient(rgba(245,166,35,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(245,166,35,0.025) 1px, transparent 1px)`,
      backgroundSize: '44px 44px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div className="anim-fade-up" style={{ width: '100%', maxWidth: 380 }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: 'rgba(226,232,240,0.4)',
          fontSize: 13, fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase', cursor: 'pointer', marginBottom: 32,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>← Back</button>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #F5A623, #FFD166)',
            borderRadius: 14, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px',
            boxShadow: '0 8px 30px rgba(245,166,35,0.4)',
          }}>
            <span style={{ fontSize: 28 }}>🔐</span>
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#fff', letterSpacing: '0.06em' }}>
            ADMIN ACCESS
          </h2>
          <p style={{ fontSize: 11, color: 'rgba(226,232,240,0.3)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>
            Authorized personnel only
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(4,20,40,0.9)', borderRadius: 10, padding: 4 }}>
          {[['owner', '👔 Owner'], ['manager', '👥 Manager']].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setError(''); setPassword(''); setUsername('') }} style={{
              flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: '0.08em',
              background: mode === m ? 'linear-gradient(135deg, #F5A623, #FFD166)' : 'transparent',
              color: mode === m ? '#020B18' : 'rgba(226,232,240,0.4)',
              transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'manager' && (
            <input
              className="input-field"
              type="text"
              placeholder="Manager username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          )}

          <input
            className="input-field"
            type="password"
            placeholder={mode === 'owner' ? 'Owner password' : 'Manager password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />

          {error && (
            <p style={{
              textAlign: 'center', fontSize: 13, color: '#FF4757',
              background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)',
              borderRadius: 6, padding: '8px 12px',
            }}>⚠ {error}</p>
          )}

          <button onClick={handleLogin} disabled={loading} style={{
            background: loading ? 'rgba(245,166,35,0.3)' : 'linear-gradient(135deg, #F5A623, #FFD166)',
            color: '#020B18', fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 20, letterSpacing: '0.1em',
            padding: '14px', borderRadius: 8, border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 6px 25px rgba(245,166,35,0.3)',
            transition: 'all 0.2s',
          }}>
            {loading ? 'CHECKING...' : 'LOGIN'}
          </button>
        </div>
      </div>
    </div>
  )
}