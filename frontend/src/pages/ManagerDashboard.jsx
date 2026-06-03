import { useState, useEffect, useCallback } from 'react'
import {
    getFleet, getActivity, getOwnerRequests,
    approveRequest, denyRequest,
    getTripRequests, approveTripRequest, denyTripRequest,
    createDriver
} from '../api/fleetApi'

function fmt(n) { return Number(n).toLocaleString() }

const statusColor = { pending: '#F5A623', approved: '#00FF88', denied: '#FF4757' }
const statusBg = { pending: 'rgba(245,166,35,0.1)', approved: 'rgba(0,255,136,0.1)', denied: 'rgba(255,71,87,0.1)' }
const REQ_LABELS = { fuel: '⛽ Fuel', repair: '🔧 Repair', other: '📋 Other' }

function KpiCard({ label, value, unit, topColor }) {
    return (
        <div style={{
            background: 'rgba(4,20,40,0.95)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '16px', position: 'relative', overflow: 'hidden', flex: 1,
        }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${topColor}, transparent)` }} />
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(226,232,240,0.35)', marginBottom: 8 }}>{label}</p>
            <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#fff', lineHeight: 1 }}>
                {value}
                {unit && <span style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)', marginLeft: 5, fontFamily: "'Rajdhani',sans-serif" }}>{unit}</span>}
            </p>
        </div>
    )
}

function SectionHeader({ title, count }) {
    return (
        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 3, height: 20, background: 'linear-gradient(180deg, #00D4FF, #0277BD)', borderRadius: 2 }} />
            <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: '#fff', letterSpacing: '0.06em', lineHeight: 1 }}>{title}</h3>
            {count > 0 && (
                <span style={{
                    background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)',
                    color: '#00D4FF', fontSize: 11, fontWeight: 700,
                    padding: '2px 8px', borderRadius: 20,
                }}>{count}</span>
            )}
        </div>
    )
}

export default function ManagerDashboard({ manager, onLogout }) {
    const [tab, setTab] = useState('fleet')
    const [drivers, setDrivers] = useState([])
    const [activity, setActivity] = useState([])
    const [requests, setRequests] = useState([])
    const [tripReqs, setTripReqs] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastUpdate, setLastUpdate] = useState(null)
    const [driverForm, setDriverForm] = useState({ id: '', name: '', plate: '', pin: '', phone: '' })
    const [addLoading, setAddLoading] = useState(false)
    const [addSuccess, setAddSuccess] = useState(false)
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)

    useEffect(() => {
        function handleResize() { setIsDesktop(window.innerWidth >= 768) }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const refresh = useCallback(async () => {
        try {
            const [fleet, act, reqs, trips] = await Promise.all([
                getFleet(), getActivity(), getOwnerRequests(), getTripRequests()
            ])
            setDrivers(fleet); setActivity(act)
            setRequests(reqs); setTripReqs(trips)
            setLastUpdate(new Date().toLocaleTimeString())
        } catch (e) { }
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
        } catch (e) { alert(e.message) }
    }

    async function handleDeny(id) {
        try {
            await denyRequest(id)
            setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'denied' } : r))
        } catch (e) { alert(e.message) }
    }

    async function handleApproveTrip(id) {
        try {
            await approveTripRequest(id)
            setTripReqs(prev => prev.map(r => r._id === id ? { ...r, status: 'approved' } : r))
            await refresh()
        } catch (e) { alert(e.message) }
    }

    async function handleDenyTrip(id) {
        try {
            await denyTripRequest(id)
            setTripReqs(prev => prev.map(r => r._id === id ? { ...r, status: 'denied' } : r))
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
    const pendingReqs = requests.filter(r => r.status === 'pending').length
    const pendingTrips = tripReqs.filter(r => r.status === 'pending').length

    // ── FLEET SECTION ──────────────────────────────────────────
    const FleetSection = () => (
        <div>
            <SectionHeader title="Fleet Register" />
            <div style={{ background: 'rgba(4,20,40,0.85)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 12, overflow: 'hidden' }}>
                {drivers.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: 32, color: 'rgba(226,232,240,0.3)', fontFamily: "'Rajdhani',sans-serif", fontSize: 13 }}>No drivers yet</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                            <thead>
                                <tr style={{ background: 'rgba(2,11,24,0.9)' }}>
                                    {['Driver', 'Vehicle', 'Trips', 'Fuel', 'Bonus'].map((h, i) => (
                                        <th key={h} style={{
                                            padding: '12px 14px', fontFamily: "'Rajdhani',sans-serif",
                                            fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
                                            textTransform: 'uppercase', color: 'rgba(0,212,255,0.6)',
                                            borderBottom: '1px solid rgba(0,212,255,0.1)',
                                            textAlign: i >= 2 ? 'center' : 'left',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {drivers.map((d, i) => (
                                    <tr key={d.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.03)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '12px 14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{
                                                    width: 30, height: 30, borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.05))',
                                                    border: '1px solid rgba(0,212,255,0.25)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: '#00D4FF',
                                                }}>{d.name.charAt(0)}</div>
                                                <div>
                                                    <p style={{ fontWeight: 600, fontSize: 13, color: '#fff' }}>{d.name}</p>
                                                    <p style={{ fontSize: 9, color: 'rgba(226,232,240,0.35)', fontFamily: "'JetBrains Mono',monospace" }}>{d.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 600, color: '#F5A623', background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', padding: '2px 7px', borderRadius: 4 }}>{d.plate}</span>
                                        </td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                            <span style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: 6, fontWeight: 700, fontSize: 13, color: '#fff' }}>{fmt(d.trips)}</span>
                                        </td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: '#00D4FF' }}>{fmt(d.fuel)}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color: '#F5A623' }}>{fmt(d.bonus)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )

    // ── REQUESTS SECTION ────────────────────────────────────────
    const RequestsSection = () => (
        <div>
            <SectionHeader title="Driver Requests" count={pendingReqs} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {requests.length === 0 ? (
                    <div style={{ background: 'rgba(4,20,40,0.8)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'rgba(226,232,240,0.25)', fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>No requests yet</div>
                ) : requests.map(r => (
                    <div key={r._id} style={{ background: 'rgba(4,20,40,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                            <div>
                                <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: '#fff', letterSpacing: '0.04em' }}>{REQ_LABELS[r.type] || r.type}</p>
                                <p style={{ fontSize: 11, color: 'rgba(226,232,240,0.5)', marginTop: 2 }}>{r.driverName} · {r.plate}</p>
                                <p style={{ fontSize: 10, color: 'rgba(226,232,240,0.3)', marginTop: 2 }}>📱 {r.phone}</p>
                                {r.description && <p style={{ fontSize: 11, color: 'rgba(226,232,240,0.35)', marginTop: 4, fontStyle: 'italic' }}>"{r.description}"</p>}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: '#F5A623' }}>{fmt(r.amount)} ETB</p>
                                <span style={{ background: statusBg[r.status], color: statusColor[r.status], fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 4, border: `1px solid ${statusColor[r.status]}40` }}>{r.status}</span>
                            </div>
                        </div>
                        {r.status === 'pending' && (
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => handleApprove(r._id)} style={{ flex: 1, padding: '8px', background: 'linear-gradient(135deg, #00C853, #00E676)', color: '#020B18', fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, letterSpacing: '0.06em', borderRadius: 7, border: 'none', cursor: 'pointer' }}>✓ APPROVE</button>
                                <button onClick={() => handleDeny(r._id)} style={{ flex: 1, padding: '8px', background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', color: '#FF4757', fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, letterSpacing: '0.06em', borderRadius: 7, cursor: 'pointer' }}>✗ DENY</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Trip approvals */}
            <div style={{ marginTop: 20 }}>
                <SectionHeader title="Trip Approvals" count={pendingTrips} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {tripReqs.length === 0 ? (
                        <div style={{ background: 'rgba(4,20,40,0.8)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'rgba(226,232,240,0.25)', fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>No trip requests yet</div>
                    ) : tripReqs.map(r => (
                        <div key={r._id} style={{
                            background: 'rgba(4,20,40,0.9)',
                            border: `1px solid ${r.status === 'pending' ? 'rgba(245,166,35,0.2)' : r.status === 'approved' ? 'rgba(0,255,136,0.15)' : 'rgba(255,71,87,0.15)'}`,
                            borderRadius: 12, padding: '14px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <div>
                                    <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: '#fff', letterSpacing: '0.04em' }}>🚛 {r.driverName}</p>
                                    <p style={{ fontSize: 11, color: 'rgba(226,232,240,0.5)', marginTop: 2 }}>{r.plate}</p>
                                    <p style={{ fontSize: 10, color: 'rgba(226,232,240,0.3)', marginTop: 2 }}>{new Date(r.createdAt).toLocaleString()}</p>
                                </div>
                                <span style={{ background: statusBg[r.status], color: statusColor[r.status], fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, border: `1px solid ${statusColor[r.status]}40` }}>{r.status}</span>
                            </div>
                            {r.status === 'pending' && (
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => handleApproveTrip(r._id)} style={{ flex: 1, padding: '8px', background: 'linear-gradient(135deg, #00C853, #00E676)', color: '#020B18', fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, letterSpacing: '0.06em', borderRadius: 7, border: 'none', cursor: 'pointer' }}>✓ APPROVE</button>
                                    <button onClick={() => handleDenyTrip(r._id)} style={{ flex: 1, padding: '8px', background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', color: '#FF4757', fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, letterSpacing: '0.06em', borderRadius: 7, cursor: 'pointer' }}>✗ DENY</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    // ── ADD DRIVER SECTION ─────────────────────────────────────
    const AddDriverSection = () => (
        <div>
            <SectionHeader title="Add Driver" />
            {addSuccess && (
                <div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, fontWeight: 600, color: '#00FF88', textAlign: 'center' }}>✅ Driver saved!</div>
            )}
            <div style={{ background: 'rgba(4,20,40,0.85)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                        { key: 'name', label: 'Full Name', placeholder: 'e.g. Abebe Kebede' },
                        { key: 'id', label: 'License ID', placeholder: 'e.g. DL-8921' },
                        { key: 'plate', label: 'Plate Number', placeholder: 'e.g. 3-A1234' },
                        { key: 'pin', label: 'PIN Code', placeholder: 'Driver PIN' },
                        { key: 'phone', label: 'Phone', placeholder: 'e.g. 0911234567' },
                    ].map(f => (
                        <div key={f.key}>
                            <label style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(0,212,255,0.55)', marginBottom: 5 }}>{f.label}</label>
                            <input className="input-field" type={f.key === 'pin' ? 'password' : 'text'} placeholder={f.placeholder} value={driverForm[f.key]} onChange={e => setDriverForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ padding: '10px 14px', fontSize: 13 }} />
                        </div>
                    ))}
                    <button onClick={handleAddDriver} disabled={addLoading} style={{
                        background: addLoading ? 'rgba(0,212,255,0.3)' : 'linear-gradient(135deg, #00D4FF, #0277BD)',
                        color: '#020B18', fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 18, letterSpacing: '0.1em', padding: '12px',
                        borderRadius: 8, border: 'none',
                        cursor: addLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 20px rgba(0,212,255,0.2)',
                    }}>
                        {addLoading ? 'SAVING...' : 'SAVE DRIVER'}
                    </button>
                </div>
            </div>
        </div>
    )

    // ── ACTIVITY SECTION ───────────────────────────────────────
    const ActivitySection = () => (
        <div>
            <SectionHeader title="Activity Log" />
            <div style={{ background: 'rgba(4,20,40,0.85)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 12, overflow: 'hidden' }}>
                {activity.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: 32, color: 'rgba(226,232,240,0.25)', fontFamily: "'Rajdhani',sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>No activity yet</p>
                ) : activity.slice(0, 20).map((a, i) => {
                    const isTrip = a.type === 'trip'
                    return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.03)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div style={{ width: 32, height: 32, borderRadius: 7, background: isTrip ? 'rgba(0,255,136,0.08)' : 'rgba(0,212,255,0.08)', border: isTrip ? '1px solid rgba(0,255,136,0.2)' : '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{isTrip ? '🚛' : '⛽'}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 600, fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {a.driver} <span style={{ color: 'rgba(226,232,240,0.35)', fontWeight: 400 }}>· {a.plate}</span>
                                </p>
                                <p style={{ fontSize: 9, color: 'rgba(226,232,240,0.3)', marginTop: 2 }}>{new Date(a.logged_at).toLocaleString()}</p>
                            </div>
                            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: isTrip ? '#00FF88' : '#00D4FF', flexShrink: 0 }}>
                                {isTrip ? '+800' : `-${fmt(a.amount)}`} ETB
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )

    // ── MOBILE TABS ────────────────────────────────────────────
    const MOBILE_TABS = [
        { key: 'fleet', label: '📊 Fleet' },
        { key: 'requests', label: `📋 Requests${pendingReqs + pendingTrips > 0 ? ` (${pendingReqs + pendingTrips})` : ''}` },
        { key: 'drivers', label: '➕ Driver' },
        { key: 'activity', label: '📜 Activity' },
    ]

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
                padding: '14px 20px', borderBottom: '1px solid rgba(0,212,255,0.1)',
                background: 'rgba(4,20,40,0.9)', flexWrap: 'wrap', gap: 8,
            }}>
                <div>
                    <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: '#fff', letterSpacing: '0.04em', lineHeight: 1 }}>
                        LOZA <span style={{ color: '#00D4FF' }}>MANAGER</span>
                    </h1>
                    <p style={{ fontSize: 9, color: 'rgba(226,232,240,0.3)', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                        {manager?.name || manager?.username} {lastUpdate && `· Updated ${lastUpdate}`}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={refresh} style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF', fontSize: 14, fontWeight: 700, padding: '7px 12px', borderRadius: 7, cursor: 'pointer' }}>↻</button>
                    <button onClick={onLogout} style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)', color: '#FF4757', fontFamily: "'Rajdhani',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '7px 12px', borderRadius: 6, cursor: 'pointer' }}>Logout</button>
                </div>
            </div>

            {/* KPI cards */}
            <div style={{ padding: '16px 20px 0', display: 'flex', gap: 8, overflowX: 'auto' }}>
                <KpiCard label="Fleet Trips" value={fmt(totalTrips)} topColor="#94a3b8" />
                <KpiCard label="Fuel Cost" value={fmt(totalFuel)} unit="ETB" topColor="#00D4FF" />
                <KpiCard label="Bonus Paid" value={fmt(totalBonus)} unit="ETB" topColor="#F5A623" />
            </div>

            {/* Manager notice */}
            <div style={{ margin: '12px 20px 0', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'rgba(0,212,255,0.7)', fontWeight: 600 }}>
                👨‍💼 Manager View — Net profit and settings are restricted to owner only
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 48, color: 'rgba(226,232,240,0.3)', fontFamily: "'Rajdhani',sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 24 }}>
                    Loading fleet data...
                </div>
            ) : isDesktop ? (
                // ── DESKTOP: ROW LAYOUT ──────────────────────────────
                <div style={{ padding: '20px' }}>
                    {/* Row 1: Fleet full width */}
                    <div style={{ marginBottom: 24 }}>
                        <FleetSection />
                    </div>

                    {/* Row 2: Requests + Add Driver */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 24 }}>
                        <RequestsSection />
                        <AddDriverSection />
                    </div>

                    {/* Row 3: Activity full width */}
                    <ActivitySection />
                </div>
            ) : (
                // ── MOBILE: TAB LAYOUT ───────────────────────────────
                <>
                    <div style={{ display: 'flex', margin: '12px 0 0', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(4,20,40,0.5)', overflowX: 'auto' }}>
                        {MOBILE_TABS.map(({ key, label }) => (
                            <button key={key} onClick={() => setTab(key)} style={{
                                flex: 1, padding: '12px 8px', whiteSpace: 'nowrap',
                                fontFamily: "'Rajdhani',sans-serif",
                                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                                color: tab === key ? '#00D4FF' : 'rgba(226,232,240,0.3)',
                                background: 'none', border: 'none',
                                borderBottom: tab === key ? '2px solid #00D4FF' : '2px solid transparent',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}>{label}</button>
                        ))}
                    </div>
                    <div style={{ padding: '20px' }}>
                        {tab === 'fleet' && <FleetSection />}
                        {tab === 'requests' && <RequestsSection />}
                        {tab === 'drivers' && <AddDriverSection />}
                        {tab === 'activity' && <ActivitySection />}
                    </div>
                </>
            )}
        </div>
    )
}