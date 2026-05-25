import { useState, useEffect } from 'react'
import { changePassword, createManager, getManagers, deleteManager } from '../api/fleetApi'

export default function SettingsPage({ onBack }) {
    const [tab, setTab] = useState('password')
    const [curr, setCurr] = useState('')
    const [next, setNext] = useState('')
    const [confirm, setConfirm] = useState('')
    const [pwMsg, setPwMsg] = useState('')
    const [pwErr, setPwErr] = useState('')
    const [pwLoading, setPwLoading] = useState(false)

    const [managers, setManagers] = useState([])
    const [mgUsername, setMgUsername] = useState('')
    const [mgPassword, setMgPassword] = useState('')
    const [mgPerms, setMgPerms] = useState({
        viewFleet: true, viewActivity: true, viewRequests: true,
        approveRequests: false, addDrivers: false, viewCharts: true,
    })
    const [mgLoading, setMgLoading] = useState(false)
    const [mgMsg, setMgMsg] = useState('')
    const [mgErr, setMgErr] = useState('')

    useEffect(() => { loadManagers() }, [])

    async function loadManagers() {
        try { setManagers(await getManagers()) } catch { }
    }

    async function handleChangePassword() {
        if (!curr || !next || !confirm) { setPwErr('All fields required'); return }
        if (next !== confirm) { setPwErr('New passwords do not match'); return }
        if (next.length < 6) { setPwErr('Password must be at least 6 characters'); return }
        setPwLoading(true); setPwErr(''); setPwMsg('')
        try {
            await changePassword(curr, next)
            setPwMsg('✅ Password changed successfully!')
            setCurr(''); setNext(''); setConfirm('')
        } catch (e) { setPwErr(e.message) }
        finally { setPwLoading(false) }
    }

    async function handleCreateManager() {
        if (!mgUsername || !mgPassword) { setMgErr('Username and password required'); return }
        setMgLoading(true); setMgErr(''); setMgMsg('')
        try {
            await createManager({ username: mgUsername, password: mgPassword, permissions: mgPerms })
            setMgMsg('✅ Manager created!')
            setMgUsername(''); setMgPassword('')
            loadManagers()
        } catch (e) { setMgErr(e.message) }
        finally { setMgLoading(false) }
    }

    async function handleDeleteManager(id) {
        if (!confirm(`Delete this manager?`)) return
        try { await deleteManager(id); loadManagers() } catch { }
    }

    const inputStyle = {
        width: '100%', padding: '12px 14px',
        background: 'rgba(4,20,40,0.9)',
        border: '1px solid rgba(245,166,35,0.15)',
        borderRadius: 8, color: '#E2E8F0',
        fontSize: 14, outline: 'none', boxSizing: 'border-box',
    }

    const btnStyle = {
        background: 'linear-gradient(135deg, #F5A623, #FFD166)',
        color: '#020B18', fontFamily: "'Bebas Neue',sans-serif",
        fontSize: 18, letterSpacing: '0.1em',
        padding: '12px', borderRadius: 8, border: 'none',
        cursor: 'pointer', width: '100%', marginTop: 4,
    }

    const permLabels = {
        viewFleet: 'View Fleet', viewActivity: 'View Activity',
        viewRequests: 'View Requests', approveRequests: 'Approve/Deny Requests',
        addDrivers: 'Add Drivers', viewCharts: 'View Charts',
    }

    return (
        <div style={{ height: '100%', overflowY: 'auto', padding: 24, background: '#020B18' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <button onClick={onBack} style={{
                    background: 'none', border: '1px solid rgba(245,166,35,0.2)',
                    color: 'rgba(226,232,240,0.5)', borderRadius: 6,
                    padding: '6px 14px', cursor: 'pointer', fontSize: 12,
                    fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>← Back</button>
                <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#fff', letterSpacing: '0.08em' }}>
                    SETTINGS
                </h1>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {[['password', '🔑 Password'], ['managers', '👥 Managers']].map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)} style={{
                        padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontFamily: "'Bebas Neue',sans-serif", fontSize: 15, letterSpacing: '0.08em',
                        background: tab === key ? 'linear-gradient(135deg,#F5A623,#FFD166)' : 'rgba(4,20,40,0.9)',
                        color: tab === key ? '#020B18' : 'rgba(226,232,240,0.5)',
                        border: tab === key ? 'none' : '1px solid rgba(245,166,35,0.15)',
                    }}>{label}</button>
                ))}
            </div>

            {/* Change Password */}
            {tab === 'password' && (
                <div style={{ background: 'rgba(4,20,40,0.95)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: 12, padding: 24 }}>
                    <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: '#F5A623', letterSpacing: '0.1em', marginBottom: 20 }}>
                        CHANGE OWNER PASSWORD
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { label: 'Current Password', val: curr, set: setCurr },
                            { label: 'New Password', val: next, set: setNext },
                            { label: 'Confirm New Password', val: confirm, set: setConfirm },
                        ].map(f => (
                            <div key={f.label}>
                                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,166,35,0.55)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                                <input type="password" value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle} />
                            </div>
                        ))}
                        {pwErr && <p style={{ color: '#FF4757', fontSize: 13, background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 6, padding: '8px 12px' }}>⚠ {pwErr}</p>}
                        {pwMsg && <p style={{ color: '#00FF88', fontSize: 13, background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 6, padding: '8px 12px' }}>{pwMsg}</p>}
                        <button onClick={handleChangePassword} disabled={pwLoading} style={btnStyle}>
                            {pwLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
                        </button>
                    </div>
                </div>
            )}

            {/* Managers */}
            {tab === 'managers' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Create manager */}
                    <div style={{ background: 'rgba(4,20,40,0.95)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: 12, padding: 24 }}>
                        <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: '#F5A623', letterSpacing: '0.1em', marginBottom: 20 }}>
                            ADD MANAGER
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,166,35,0.55)', display: 'block', marginBottom: 6 }}>Username</label>
                                <input value={mgUsername} onChange={e => setMgUsername(e.target.value)} style={inputStyle} placeholder="e.g. manager1" />
                            </div>
                            <div>
                                <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,166,35,0.55)', display: 'block', marginBottom: 6 }}>Password</label>
                                <input type="password" value={mgPassword} onChange={e => setMgPassword(e.target.value)} style={inputStyle} placeholder="Manager password" />
                            </div>

                            {/* Permissions */}
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,166,35,0.55)', marginTop: 4 }}>Permissions</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {Object.entries(permLabels).map(([key, label]) => (
                                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'rgba(226,232,240,0.6)' }}>
                                        <input type="checkbox" checked={mgPerms[key]} onChange={e => setMgPerms(p => ({ ...p, [key]: e.target.checked }))}
                                            style={{ accentColor: '#F5A623', width: 14, height: 14 }} />
                                        {label}
                                    </label>
                                ))}
                            </div>

                            {mgErr && <p style={{ color: '#FF4757', fontSize: 13, background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 6, padding: '8px 12px' }}>⚠ {mgErr}</p>}
                            {mgMsg && <p style={{ color: '#00FF88', fontSize: 13, background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 6, padding: '8px 12px' }}>{mgMsg}</p>}
                            <button onClick={handleCreateManager} disabled={mgLoading} style={btnStyle}>
                                {mgLoading ? 'CREATING...' : 'CREATE MANAGER'}
                            </button>
                        </div>
                    </div>

                    {/* Manager list */}
                    {managers.length > 0 && (
                        <div style={{ background: 'rgba(4,20,40,0.95)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: 12, padding: 24 }}>
                            <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: '#F5A623', letterSpacing: '0.1em', marginBottom: 16 }}>
                                EXISTING MANAGERS
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {managers.map(m => (
                                    <div key={m._id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px 16px',
                                        border: '1px solid rgba(245,166,35,0.08)',
                                    }}>
                                        <div>
                                            <p style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{m.username}</p>
                                            <p style={{ fontSize: 10, color: 'rgba(226,232,240,0.35)', marginTop: 2 }}>
                                                {Object.entries(m.permissions).filter(([, v]) => v).map(([k]) => permLabels[k]).join(', ')}
                                            </p>
                                        </div>
                                        <button onClick={() => handleDeleteManager(m._id)} style={{
                                            background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)',
                                            color: '#FF4757', borderRadius: 6, padding: '6px 12px',
                                            cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                                        }}>DELETE</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}