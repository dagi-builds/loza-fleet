import { useState, useEffect, useCallback } from 'react'
import { getFleet, getActivity, getOwnerRequests, approveRequest, denyRequest, createDriver, getNotifications } from '../api/fleetApi'
import StatsTable from '../components/StatsTable'
import ChartsPage from './ChartsPage'
import SettingsPage from './SettingsPage'
import DriverHistoryPage from './DriverHistoryPage'

function fmt(n) { return Number(n).toLocaleString() }

const statusColor = { pending: '#F5A623', approved: '#00FF88', denied: '#FF4757' }
const statusBg = { pending: 'rgba(245,166,35,0.1)', approved: 'rgba(0,255,136,0.1)', denied: 'rgba(255,71,87,0.1)' }
const REQ_LABELS = { fuel: '⛽ Fuel', salary: '💰 Salary', repair: '🔧 Repair', other: '📋 Other' }

function KpiCard({ label, value, unit, topColor }) {
    return (
        <div style={{
            background: 'rgba(4,20,40,0.95)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '18px 16px', position: 'relative', overflow: 'hidden',
        }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${topColor}, transparent)`
            }} />
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(226,232,240,0.35)', marginBottom: 8 }}>{label}</p>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#fff', lineHeight: 1 }}>
                {value}
                {unit && <span style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)', marginLeft: 5, fontFamily: "'Rajdhani', sans-serif" }}>{unit}</span>}
            </p>
        </div>
    )
}

export default function OwnerDashboard({ onLogout }) {
    const [tab, setTab] = useState('fleet')
    const [page, setPage] = useState('dashboard') // 'dashboard' | 'charts' | 'settings' | 'history'
    const [selectedDriver, setSelectedDriver] = useState(null)
    const [drivers, setDrivers] = useState([])
    const [activity, setActivity] = useState([])
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [lastUpdate, setLastUpdate] = useState(null)
    const [driverForm, setDriverForm] = useState({ id: '', name: '', plate: '', pin: '', phone: '' })
    const [addLoading, setAddLoading] = useState(false)
    const [addSuccess, setAddSuccess] = useState(false)
    const [notifications, setNotifications] = useState({ count: 0, latest: [] })
    const [showNotifPopup, setShowNotifPopup] = useState(false)

    const refresh = useCallback(async () => {
        try {
            const [fleet, act, reqs, notifs] = await Promise.all([
                getFleet(), getActivity(), getOwnerRequests(), getNotifications()
            ])
            setDrivers(fleet); setActivity(act); setRequests(reqs)
            setNotifications(notifs); setError('')
            setLastUpdate(new Date().toLocaleTimeString())
        } catch (e) { setError('Cannot reach server') }
        finally { setLoading(false) }
    }, [])

    useEffect(() => {
        refresh()
        const t = setInterval(refresh, 15000)
        return () => clearInterval(t)
    }, [refresh])

    async function handleApprove(id) {
        try {
            await approveRequest(id)
            setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'approved' } : r))
            setNotifications(n => ({ ...n, count: Math.max(0, n.count - 1) }))
        } catch (e) { alert(e.message) }
    }

    async function handleDeny(id) {
        try {
            await denyRequest(id)
            setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'denied' } : r))
            setNotifications(n => ({ ...n, count: Math.max(0, n.count - 1) }))
        } catch (e) { alert(e.message) }
    }

    async function handleAddDriver() {
        const { id, name, plate, pin } = driverForm
        if (!id || !name || !plate || !pin) { alert('Fill all required fields'); return }
        setAddLoading(true)
        try {
            await createDriver(driverForm)
            setAddSuccess(true)
            setDriverForm({ id: '', name: '', plate: '', pin: '', phone: '' })
            await refresh()
            setTimeout(() => setAddSuccess(false), 3000)
        } catch (e) { alert(e.message) }
        finally { setAddLoading(false) }
    }

    const totalTrips = drivers.reduce((s, d) => s + Number(d.trips), 0)
    const totalFuel = drivers.reduce((s, d) => s + Number(d.fuel), 0)
    const totalBonus = drivers.reduce((s, d) => s + Number(d.bonus), 0)
    const totalProfit = drivers.reduce((s, d) => s + Number(d.profit) - Number(d.fuel), 0)
    const pendingCount = requests.filter(r => r.status === 'pending').length

    const TABS = [
        { key: 'fleet', label: '📊 Fleet' },
        { key: 'requests', label: `📋 Requests${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
        { key: 'drivers', label: '➕ Add Driver' },
        { key: 'activity', label: '📜 Activity' },
    ]

    // Show sub-pages
    if (page === 'charts') return <ChartsPage onBack={() => setPage('dashboard')} />
    if (page === 'settings') return <SettingsPage onBack={() => setPage('dashboard')} />
    if (page === 'history' && selectedDriver) return (
        <DriverHistoryPage driver={selectedDriver} onBack={() => { setPage('dashboard'); setSelectedDriver(null) }} />
    )

    return (
        <div style={{
            minHeight: '100vh', background: '#020B18',
            backgroundImage: `linear-gradient(rgba(0,212,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.018) 1px, transparent 1px)`,
            backgroundSize: '44px 44px',
        }}>
            <div className="et-bar" />

            {/* Header */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 24px', borderBottom: '1px solid rgba(245,166,35,0.1)',
                background: 'rgba(4,20,40,0.9)',
            }}>
                <div>
                    <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#fff', letterSpacing: '0.04em', lineHeight: 1 }}>
                        LOZA <span style={{ color: '#F5A623' }}>CONSTRUCTION</span>
                    </h1>
                    <p style={{ fontSize: 9, color: 'rgba(226,232,240,0.3)', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                        Owner Dashboard {lastUpdate && `· Updated ${lastUpdate}`}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

                    {/* Charts button */}
                    <button onClick={() => setPage('charts')} style={{
                        background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
                        color: '#00D4FF', fontSize: 16, padding: '8px 12px',
                        borderRadius: 7, cursor: 'pointer',
                    }} title="Charts">📈</button>

                    {/* Settings button */}
                    <button onClick={() => setPage('settings')} style={{
                        background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)',
                        color: '#F5A623', fontSize: 16, padding: '8px 12px',
                        borderRadius: 7, cursor: 'pointer',
                    }} title="Settings">⚙️</button>

                    {/* Notification bell */}
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setShowNotifPopup(s => !s)} style={{
                            background: notifications.count > 0 ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${notifications.count > 0 ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.08)'}`,
                            color: notifications.count > 0 ? '#F5A623' : 'rgba(226,232,240,0.4)',
                            fontSize: 16, padding: '8px 12px', borderRadius: 7, cursor: 'pointer', position: 'relative',
                        }} title="Notifications">
                            🔔
                            {notifications.count > 0 && (
                                <span style={{
                                    position: 'absolute', top: -6, right: -6,
                                    background: '#FF4757', color: '#fff',
                                    fontSize: 10, fontWeight: 700, borderRadius: '50%',
                                    width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>{notifications.count}</span>
                            )}
                        </button>

                        {/* Notification popup */}
                        {showNotifPopup && (
                            <div style={{
                                position: 'absolute', top: 44, right: 0, zIndex: 100,
                                background: 'rgba(4,20,40,0.98)', border: '1px solid rgba(245,166,35,0.2)',
                                borderRadius: 12, padding: 16, minWidth: 280,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                            }}>
                                <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: '#F5A623', letterSpacing: '0.1em', marginBottom: 12 }}>
                                    PENDING REQUESTS
                                </p>
                                {notifications.latest.length === 0 ? (
                                    <p style={{ color: 'rgba(226,232,240,0.35)', fontSize: 13 }}>No pending requests</p>
                                ) : notifications.latest.map(r => (
                                    <div key={r._id} style={{
                                        padding: '10px 12px', borderRadius: 8, marginBottom: 8,
                                        background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.1)',
                                    }}>
                                        <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{r.driverName} · {REQ_LABELS[r.type]}</p>
                                        <p style={{ color: '#F5A623', fontSize: 12, marginTop: 2 }}>{fmt(r.amount)} ETB</p>
                                    </div>
                                ))}
                                <button onClick={() => { setTab('requests'); setShowNotifPopup(false) }} style={{
                                    marginTop: 8, width: '100%', padding: '8px',
                                    background: 'linear-gradient(135deg,#F5A623,#FFD166)',
                                    color: '#020B18', fontFamily: "'Bebas Neue',sans-serif",
                                    fontSize: 14, letterSpacing: '0.08em', border: 'none',
                                    borderRadius: 6, cursor: 'pointer',
                                }}>VIEW ALL REQUESTS</button>
                            </div>
                        )}
                    </div>

                    {/* Refresh */}
                    <button onClick={refresh} style={{
                        background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)',
                        color: '#F5A623', fontFamily: "'Rajdhani', sans-serif",
                        fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                        padding: '8px 14px', borderRadius: 7, cursor: 'pointer',
                    }}>↻</button>

                    {/* Logout */}
                    <button onClick={onLogout} style={{
                        background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)',
                        color: '#FF4757', fontFamily: "'Rajdhani', sans-serif",
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                        padding: '8px 14px', borderRadius: 6, cursor: 'pointer',
                    }}>Logout</button>
                </div>
            </div>

            {/* KPI cards */}
            <div style={{ padding: '20px 24px 0', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
                <KpiCard label="Fleet Trips" value={fmt(totalTrips)} topColor="#94a3b8" />
                <KpiCard label="Fuel Cost" value={fmt(totalFuel)} unit="ETB" topColor="#00D4FF" />
                <KpiCard label="Bonus Paid" value={fmt(totalBonus)} unit="ETB" topColor="#F5A623" />
                <KpiCard label="Net Profit" value={fmt(totalProfit)} unit="ETB" topColor={totalProfit >= 0 ? '#00FF88' : '#FF4757'} />
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex', margin: '20px 0 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(4,20,40,0.5)', overflowX: 'auto',
            }}>
                {TABS.map(({ key, label }) => (
                    <button key={key} onClick={() => setTab(key)} style={{
                        padding: '12px 16px', whiteSpace: 'nowrap',
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: tab === key ? '#F5A623' : 'rgba(226,232,240,0.3)',
                        background: 'none', border: 'none',
                        borderBottom: tab === key ? '2px solid #F5A623' : '2px solid transparent',
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}>{label}</button>
                ))}
            </div>

            <div style={{ padding: '24px' }}>

                {/* FLEET TAB */}
                {tab === 'fleet' && (
                    loading ? (
                        <div style={{ textAlign: 'center', padding: 48, color: 'rgba(226,232,240,0.3)', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading...</div>
                    ) : (
                        <div>
                            <StatsTable drivers={drivers} />
                            {/* Driver history buttons */}
                            {drivers.length > 0 && (
                                <div style={{ marginTop: 20 }}>
                                    <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: '#F5A623', letterSpacing: '0.1em', marginBottom: 12 }}>DRIVER HISTORY</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {drivers.map(d => (
                                            <button key={d.id} onClick={() => { setSelectedDriver(d); setPage('history') }} style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                background: 'rgba(4,20,40,0.9)', border: '1px solid rgba(245,166,35,0.1)',
                                                borderRadius: 10, padding: '12px 16px', cursor: 'pointer',
                                                transition: 'all 0.2s',
                                            }}>
                                                <div style={{ textAlign: 'left' }}>
                                                    <p style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{d.name}</p>
                                                    <p style={{ color: 'rgba(226,232,240,0.4)', fontSize: 11, marginTop: 2 }}>{d.plate} · {d.trips} trips</p>
                                                </div>
                                                <span style={{ color: '#F5A623', fontSize: 18 }}>→</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                )}

                {/* REQUESTS TAB */}
                {tab === 'requests' && (
                    <div className="anim-fade-up">
                        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#fff', letterSpacing: '0.06em', marginBottom: 20 }}>DRIVER REQUESTS</h3>
                        {error && <p style={{ color: '#FF4757', marginBottom: 16 }}>⚠ {error}</p>}
                        {requests.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 48, color: 'rgba(226,232,240,0.25)', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>No requests yet</div>
                        ) : requests.map((r) => (
                            <div key={r._id} style={{ background: 'rgba(4,20,40,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '18px', marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div>
                                        <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: '#fff', letterSpacing: '0.04em' }}>{REQ_LABELS[r.type] || r.type}</p>
                                        <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.5)', marginTop: 2 }}>{r.driverName} · {r.plate}</p>
                                        <p style={{ fontSize: 11, color: 'rgba(226,232,240,0.3)', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>📱 {r.phone} · {new Date(r.createdAt).toLocaleDateString()}</p>
                                        {r.description && <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.4)', marginTop: 6, fontStyle: 'italic' }}>"{r.description}"</p>}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#F5A623' }}>{fmt(r.amount)} ETB</p>
                                        <span style={{ background: statusBg[r.status], color: statusColor[r.status], fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, border: `1px solid ${statusColor[r.status]}40` }}>{r.status}</span>
                                    </div>
                                </div>
                                {r.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => handleApprove(r._id)} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #00C853, #00E676)', color: '#020B18', fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: '0.06em', borderRadius: 8, border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,200,83,0.3)' }}>✓ APPROVE</button>
                                        <button onClick={() => handleDeny(r._id)} style={{ flex: 1, padding: '10px', background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', color: '#FF4757', fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: '0.06em', borderRadius: 8, cursor: 'pointer' }}>✗ DENY</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ADD DRIVER TAB */}
                {tab === 'drivers' && (
                    <div className="anim-fade-up" style={{ maxWidth: 480 }}>
                        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#fff', letterSpacing: '0.06em', marginBottom: 20 }}>ADD / UPDATE DRIVER</h3>
                        {addSuccess && (
                            <div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, fontWeight: 600, color: '#00FF88', textAlign: 'center' }}>✅ Driver saved successfully!</div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {[
                                { key: 'name', label: 'Full Name', placeholder: 'e.g. Abebe Kebede' },
                                { key: 'id', label: 'License ID', placeholder: 'e.g. DL-8921' },
                                { key: 'plate', label: 'Plate Number', placeholder: 'e.g. 3-A1234' },
                                { key: 'pin', label: 'PIN Code', placeholder: 'e.g. 4821 (driver uses this to login)' },
                                { key: 'phone', label: 'Phone Number', placeholder: 'e.g. 0911234567' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,166,35,0.55)', marginBottom: 6 }}>{f.label}</label>
                                    <input className="input-field" type={f.key === 'pin' ? 'password' : 'text'} placeholder={f.placeholder} value={driverForm[f.key]} onChange={e => setDriverForm(p => ({ ...p, [f.key]: e.target.value }))} />
                                </div>
                            ))}
                            <button onClick={handleAddDriver} disabled={addLoading} style={{ background: addLoading ? 'rgba(245,166,35,0.3)' : 'linear-gradient(135deg, #F5A623, #FFD166)', color: '#020B18', fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: '0.1em', padding: '14px', borderRadius: 8, border: 'none', cursor: addLoading ? 'not-allowed' : 'pointer', boxShadow: '0 6px 25px rgba(245,166,35,0.3)' }}>
                                {addLoading ? 'SAVING...' : 'SAVE DRIVER'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ACTIVITY TAB */}
                {tab === 'activity' && (
                    <div className="anim-fade-up">
                        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#fff', letterSpacing: '0.06em', marginBottom: 20 }}>ACTIVITY LOG</h3>
                        <div style={{ background: 'rgba(4,20,40,0.85)', border: '1px solid rgba(245,166,35,0.1)', borderRadius: 12, overflow: 'hidden' }}>
                            {activity.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: 48, color: 'rgba(226,232,240,0.25)', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>No activity yet</p>
                            ) : activity.map((a, i) => {
                                const isTrip = a.type === 'trip'
                                return (
                                    <div key={i} className="premium-row" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 8, background: isTrip ? 'rgba(0,255,136,0.08)' : 'rgba(0,212,255,0.08)', border: isTrip ? '1px solid rgba(0,255,136,0.2)' : '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{isTrip ? '🚛' : '⛽'}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 600, fontSize: 14, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.driver} <span style={{ color: 'rgba(226,232,240,0.35)', fontWeight: 400 }}>· {a.plate}</span></p>
                                            <p style={{ fontSize: 10, color: 'rgba(226,232,240,0.3)', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{new Date(a.logged_at).toLocaleString()}</p>
                                        </div>
                                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: isTrip ? '#00FF88' : '#00D4FF', flexShrink: 0 }}>
                                            {isTrip ? '+800' : `-${fmt(a.amount)}`} ETB
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}