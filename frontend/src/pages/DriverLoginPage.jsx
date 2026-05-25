import { useState } from 'react'
import { loginWithPin } from '../api/fleetApi'

export default function DriverLoginPage({ onSuccess, onBack }) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!pin.trim()) { setError('Enter your PIN'); return }
    setLoading(true); setError('')
    try {
      const driver = await loginWithPin(pin)
      onSuccess(driver)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#020B18',
      backgroundImage: `
        linear-gradient(rgba(0,200,83,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,200,83,0.02) 1px, transparent 1px)`,
      backgroundSize: '44px 44px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div className="anim-fade-up" style={{ width: '100%', maxWidth: 380 }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: 'rgba(226,232,240,0.4)',
          fontSize: 13, fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase', cursor: 'pointer', marginBottom: 32,
        }}>← Back</button>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #00C853, #00E676)',
            borderRadius: 14, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px',
            boxShadow: '0 8px 30px rgba(0,200,83,0.35)',
          }}>
            <span style={{ fontSize: 28 }}>🚛</span>
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#fff', letterSpacing: '0.06em' }}>
            DRIVER LOGIN
          </h2>
          <p style={{ fontSize: 11, color: 'rgba(226,232,240,0.3)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>
            Enter your PIN code from owner
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            className="input-field"
            type="password"
            placeholder="Enter PIN code"
            value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ textAlign: 'center', fontSize: 24, letterSpacing: '0.3em' }}
          />

          {error && (
            <p style={{
              textAlign: 'center', fontSize: 13, color: '#FF4757',
              background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)',
              borderRadius: 6, padding: '8px 12px',
            }}>⚠ {error}</p>
          )}

          <button onClick={handleLogin} disabled={loading} style={{
            background: loading ? 'rgba(0,200,83,0.3)' : 'linear-gradient(135deg, #00C853, #00E676)',
            color: '#020B18', fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 20, letterSpacing: '0.1em',
            padding: '14px', borderRadius: 8, border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 6px 25px rgba(0,200,83,0.3)',
            transition: 'all 0.2s',
          }}>
            {loading ? 'CHECKING...' : 'START SHIFT'}
          </button>
        </div>
      </div>
    </div>
  )
}