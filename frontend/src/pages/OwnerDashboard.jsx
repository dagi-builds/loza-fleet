import { useState, useEffect, useCallback } from 'react'
import { getFleet, getActivity, getOwnerRequests, approveRequest, denyRequest, createDriver, getNotifications } from '../api/fleetApi'
import StatsTable from '../components/StatsTable'
import ChartsPage from './ChartsPage'
import SettingsPage from './SettingsPage'
import DriverHistoryPage from './DriverHistoryPage'

function fmt(n) { return Number(n).toLocaleString() }

const statusColor = { pending: '#F5A623', approved: '#00FF88', denied: '#FF4757' }
const statusBg = { pending: 'rgba(245,166,35,0.1)', approved: 'rgba(0,255,136,0.1)', denied: 'rgba(255,71,87,0.1)' }
const REQ_LABELS = { fuel: '⛽ Fuel', repair: '🔧 Repair', other: '📋 Other' }

function KpiCard({ label, value, unit, topColor }) {
    return (
        <div style={{
            background: 'rgba(4,20,40,0.95)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '16px', position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${topColor}, transparent)` }} />
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(226,232,240,0.35)', marginBottom: 6 }}>{label}</p>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#fff', lineHeight: 1 }}>
                {value}
                {unit && <span style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)', marginLeft: 4, fontFamily: "'Rajdhani', sans-serif" }}>{unit}</span>}
            </p>
        </div>
    )
}

export default function OwnerDashboard({ onLogout }) {
    const [tab, setTab] = useState('fleet')
    const [page, setPage] = useState('dashboard')
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

    // Search & filter
    const [driverSearch, setDriverSearch] = useState('')
    const [reqFilter, setReqFilter] = useState('all')
    const [reqSearch, setReqSearch] = useState('')

    // Pagination
    const [fleetPage, setFleetPage] = useState(1)
    const [reqPage, setReqPage] = useState(1)
    const [actPage, setActPage] = useState(1)
    const PER_PAGE = 5

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

    // Filtered drivers
    const filteredDrivers = drivers.filter(d =>
        d.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
        d.plate.toLowerCase().includes(driverSearch.toLowerCase()) ||
        d.id.toLowerCase().includes(driverSearch.toLowerCase())
    )

    // Filtered requests
    const filteredRequests = requests.filter(r => {
        const matchesFilter = reqFilter === 'all' || r.status === reqFilter
        const matchesSearch = r.driverName.toLowerCase().includes(reqSearch.toLowerCase()) ||
            r.plate.toLowerCase().includes(reqSearch.toLowerCase())
        return matchesFilter && matchesSearch
    })

    // Pagination
    const fleetPages = Math.ceil(filteredDrivers.length / PER_PAGE)
    const paginatedDrivers = filteredDrivers.slice((fleetPage - 1) * PER_PAGE, fleetPage * PER_PAGE)
    const reqPages = Math.ceil(filteredRequests.length / PER_PAGE)
    const paginatedRequests = filteredRequests.slice((reqPage - 1) * PER_PAGE, reqPage * PER_PAGE)
    const actPages = Math.ceil(activity.length / PER_PAGE)
    const paginatedActivity = activity.slice((actPage - 1) * PER_PAGE, actPage * PER_PAGE)

    const TABS = [
        { key: 'fleet', label: '📊 Fleet' },
        { key: 'requests', label: `📋 Requests${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
        { key: 'drivers', label: '➕ Add Driver' },
        { key: 'activity', label: '📜 Activity' },
    ]

    function Pagination({ current, total, onChange }) {
        if (total <= 1) return null
        return (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                <button onClick={() => onChange(Math.max(1, current - 1))} disabled={current === 1} style={{
                    padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(245,166,35,0.2)',
                    background: 'rgba(4,20,40,0.9)', color: current === 1 ? 'rgba(226,232,240,0.2)' : '#F5A623',
                    cursor: current === 1 ? 'not-allowed' : 'pointer', fontWeight: 700,
                }}>←</button>
                <span style={{ color: 'rgba(226,232,240,0.4)', fontSize: 13, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                    {current} / {total}
                </span>
                <button onClick={() => onChange(Math.min(total, current + 1))} disabled={current === total} style={{
                    padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(245,166,35,0.2)',
                    background: 'rgba(4,20,40,0.9)', color: current === total ? 'rgba(226,232,240,0.2)' : '#F5A623',
                    cursor: current === total ? 'not-allowed' : 'pointer', fontWeight: 700,
                }}>→</button>
            </div>
        )
    }

    if (page === 'charts') return <ChartsPage onBack={() => setPage('dashboard')} />
    if (page === 'settings') return <SettingsPage onBack={() => setPage('dashboard')} />
    if (page === 'history' && selectedDriver) return (
        <DriverHistoryPage driver={selectedDriver} onBack={() => { setPage('dashboard'); setSelectedDriver(null) }} />
    )

    return (
        <div style={{ minHeight: '100vh', background: '#020B18', backgroundImage: `linear-gradient(rgba(0,212,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.018) 1px, transparent 1px)`, backgroundSize: '44px 44px' }}>
            <div className="et-bar" />

            {/* Header */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', borderBottom: '1px solid rgba(245,166,35,0.1)',
                background: 'rgba(4,20,40,0.9)', flexWrap: 'wrap', gap: 8,
            }}>
                <div>
                    <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#fff', letterSpacing: '0.04em', lineHeight: 1 }}>
                        LOZA <span style={{ color: '#F5A623' }}>CONSTRUCTION</span>
                    </h1>
                    <p style={{ fontSize: 9, color: 'rgba(226,232,240,0.3)', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                        {lastUpdate && `Updated ${lastUpdate}`}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => setPage('charts')} style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF', fontSize: 16, padding: '7px 10px', borderRadius: 7, cursor: 'pointer' }} title="Charts">📈</button>
                    <button onClick={() => setPage('settings')} style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', color: '#F5A623', fontSize: 16, padding: '7px 10px', borderRadius: 7, cursor: 'pointer' }} title="Settings">⚙️</button>

                    {/* Bell */}
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setShowNotifPopup(s => !s)} style={{
                            background: notifications.count > 0 ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${notifications.count > 0 ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.08)'}`,
                            color: notifications.count > 0 ? '#F5A623' : 'rgba(226,232,240,0.4)',
                            fontSize: 16, padding: '7px 10px', borderRadius: 7, cursor: 'pointer', position: 'relative',
                        }}>
                            🔔
                            {notifications.count > 0 && (
                                <span style={{ position: 'absolute', top: -6, right: -6, background: '#FF4757', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notifications.count}</span>
                            )}
                        </button>
                        {showNotifPopup && (
                            <div style={{ position: 'absolute', top: 44, right: 0, zIndex: 100, background: 'rgba(4,20,40,0.98)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 12, padding: 16, minWidth: 260, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                                <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: '#F5A623', letterSpacing: '0.1em', marginBottom: 12 }}>PENDING REQUESTS</p>
                                {notifications.latest.length === 0 ? (
                                    <p style={{ color: 'rgba(226,232,240,0.35)', fontSize: 13 }}>No pending requests</p>
                                ) : notifications.latest.map(r => (
                                    <div key={r._id} style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 8, background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.1)' }}>
                                        <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{r.driverName} · {REQ_LABELS[r.type]}</p>
                                        <p style={{ color: '#F5A623', fontSize: 12, marginTop: 2 }}>{fmt(r.amount)} ETB</p>
                                    </div>
                                ))}
                                <button onClick={() => { setTab('requests'); setShowNotifPopup(false) }} style={{ marginTop: 8, width: '100%', padding: '8px', background: 'linear-gradient(135deg,#F5A623,#FFD166)', color: '#020B18', fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, letterSpacing: '0.08em', border: 'none', borderRadius: 6, cursor: 'pointer' }}>VIEW ALL</button>
                            </div>
                        )}
                    </div>

                    <button onClick={refresh} style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', color: '#F5A623', fontSize: 14, fontWeight: 700, padding: '7px 12px', borderRadius: 7, cursor: 'pointer' }}>↻</button>
                    <button onClick={onLogout} style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)', color: '#FF4757', fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '7px 12px', borderRadius: 6, cursor: 'pointer' }}>Logout</button>
                </div>
            </div>

            {/* KPI cards */}
            <div style={{ padding: '16px 16px 0', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
                <KpiCard label="Fleet Trips" value={fmt(totalTrips)} topColor="#94a3b8" />
                <KpiCard label="Fuel Cost" value={fmt(totalFuel)} unit="ETB" topColor="#00D4FF" />
                <KpiCard label="Bonus Paid" value={fmt(totalBonus)} unit="ETB" topColor="#F5A623" />
                <KpiCard label="Net Profit" value={fmt(totalProfit)} unit="ETB" topColor={totalProfit >= 0 ? '#00FF88' : '#FF4757'} />
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', margin: '16px 0 0', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(4,20,40,0.5)', overflowX: 'auto' }}>
                {TABS.map(({ key, label }) => (
                    <button key={key} onClick={() => setTab(key)} style={{
                        flex: 1, padding: '12px 8px', whiteSpace: 'nowrap',
                        fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: tab === key ? '#F5A623' : 'rgba(226,232,240,0.3)',
                        background: 'none', border: 'none',
                        borderBottom: tab === key ? '2px solid #F5A623' : '2px solid transparent',
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}>{label}</button>
                ))}
            </div>

            <div style={{ padding: '16px' }}>

                {/* FLEET TAB */}
                {tab === 'fleet' && (
                    <div>
                        {/* Search bar */}
                        <input
                            placeholder="🔍 Search driver, plate, ID..."
                            value={driverSearch}
                            onChange={e => { setDriverSearch(e.target.value); setFleetPage(1) }}
                            style={{
                                width: '100%', padding: '12px 16px', marginBottom: 16,
                                background: 'rgba(4,20,40,0.9)', border: '1px solid rgba(245,166,35,0.15)',
                                borderRadius: 8, color: '#E2E8F0', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                            }}
                        />
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 48, color: 'rgba(226,232,240,0.3)', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading...</div>
                        ) : (
                            <div>
                                {paginatedDrivers.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'rgba(226,232,240,0.3)', padding: 32 }}>No drivers found</p>
                                ) : paginatedDrivers.map(d => (
                                    <div key={d.id} style={{
                                        background: 'rgba(4,20,40,0.9)', border: '1px solid rgba(245,166,35,0.1)',
                                        borderRadius: 12, padding: '16px', marginBottom: 10,
                                        opacity: d.terminated ? 0.5 : 1,
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                            <div>
                                                <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: d.terminated ? '#FF4757' : '#fff', letterSpacing: '0.04em' }}>
                                                    {d.name} {d.terminated && <span style={{ fontSize: 11, color: '#FF4757' }}>(TERMINATED)</span>}
                                                </p>
                                                <p style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)', marginTop: 2 }}>{d.plate} · ID: {d.id}</p>
                                            </div>
                                            <button onClick={() => { setSelectedDriver(d); setPage('history') }} style={{
                                                background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)',
                                                color: '#F5A623', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                                                padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
                                            }}>HISTORY →</button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                                            {[
                                                { label: 'Trips', value: d.trips, color: '#fff' },
                                                { label: 'Fuel', value: `${fmt(d.fuel)}`, color: '#00D4FF' },
                                                { label: 'Bonus', value: `${fmt(d.bonus)}`, color: '#F5A623' },
                                                { label: 'Net', value: `${fmt(d.profit - d.fuel)}`, color: (d.profit - d.fuel) >= 0 ? '#00FF88' : '#FF4757' },
                                            ].map(s => (
                                                <div key={s.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 4px' }}>
                                                    <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: s.color }}>{s.value}</p>
                                                    <p style={{ fontSize: 9, color: 'rgba(226,232,240,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{s.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <Pagination current={fleetPage} total={fleetPages} onChange={setFleetPage} />
                            </div>
                        )}
                    </div>
                )}

                {/* REQUESTS TAB */}
                {tab === 'requests' && (
                    <div>
                        {/* Search + Filter */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                            <input
                                placeholder="🔍 Search driver, plate..."
                                value={reqSearch}
                                onChange={e => { setReqSearch(e.target.value); setReqPage(1) }}
                                style={{
                                    flex: 1, minWidth: 160, padding: '10px 14px',
                                    background: 'rgba(4,20,40,0.9)', border: '1px solid rgba(245,166,35,0.15)',
                                    borderRadius: 8, color: '#E2E8F0', fontSize: 13, outline: 'none',
                                }}
                            />
                            {['all', 'pending', 'approved', 'denied'].map(f => (
                                <button key={f} onClick={() => { setReqFilter(f); setReqPage(1) }} style={{
                                    padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                    fontFamily: "'Rajdhani',sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                                    background: reqFilter === f ? 'linear-gradient(135deg,#F5A623,#FFD166)' : 'rgba(4,20,40,0.9)',
                                    color: reqFilter === f ? '#020B18' : 'rgba(226,232,240,0.4)',
                                    border: reqFilter === f ? 'none' : '1px solid rgba(245,166,35,0.15)',
                                }}>{f}</button>
                            ))}
                        </div>

                        {filteredRequests.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 48, color: 'rgba(226,232,240,0.25)', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>No requests found</div>
                        ) : (
                            <>
                                {paginatedRequests.map((r) => (
                                    <div key={r._id} style={{ background: 'rgba(4,20,40,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                            <div>
                                                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: '#fff', letterSpacing: '0.04em' }}>{REQ_LABELS[r.type] || r.type}</p>
                                                <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.5)', marginTop: 2 }}>{r.driverName} · {r.plate}</p>
                                                <p style={{ fontSize: 11, color: 'rgba(226,232,240,0.3)', marginTop: 2 }}>📱 {r.phone} · {new Date(r.createdAt).toLocaleString()}</p>
                                                {r.description && <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.4)', marginTop: 4, fontStyle: 'italic' }}>"{r.description}"</p>}
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: '#F5A623' }}>{fmt(r.amount)} ETB</p>
                                                <span style={{ background: statusBg[r.status], color: statusColor[r.status], fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, border: `1px solid ${statusColor[r.status]}40` }}>{r.status}</span>
                                            </div>
                                        </div>
                                        {r.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button onClick={() => handleApprove(r._id)} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #00C853, #00E676)', color: '#020B18', fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: '0.06em', borderRadius: 8, border: 'none', cursor: 'pointer' }}>✓ APPROVE</button>
                                                <button onClick={() => handleDeny(r._id)} style={{ flex: 1, padding: '10px', background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', color: '#FF4757', fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: '0.06em', borderRadius: 8, cursor: 'pointer' }}>✗ DENY</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <Pagination current={reqPage} total={reqPages} onChange={setReqPage} />
                            </>
                        )}
                    </div>
                )}

                {/* ADD DRIVER TAB */}
                {tab === 'drivers' && (
                    <div style={{ maxWidth: 500, margin: '0 auto' }}>
                        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#fff', letterSpacing: '0.06em', marginBottom: 20 }}>ADD / UPDATE DRIVER</h3>
                        {addSuccess && (
                            <div style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, fontWeight: 600, color: '#00FF88', textAlign: 'center' }}>✅ Driver saved successfully!</div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {[
                                { key: 'name', label: 'Full Name', placeholder: 'e.g. Abebe Kebede' },
                                { key: 'id', label: 'License ID', placeholder: 'e.g. DL-8921' },
                                { key: 'plate', label: 'Plate Number', placeholder: 'e.g. 3-A1234' },
                                { key: 'pin', label: 'PIN Code', placeholder: 'e.g. 4821' },
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
                    <div>
                        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#fff', letterSpacing: '0.06em', marginBottom: 16 }}>ACTIVITY LOG</h3>
                        <div style={{ background: 'rgba(4,20,40,0.85)', border: '1px solid rgba(245,166,35,0.1)', borderRadius: 12, overflow: 'hidden' }}>
                            {paginatedActivity.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: 48, color: 'rgba(226,232,240,0.25)', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>No activity yet</p>
                            ) : paginatedActivity.map((a, i) => {
                                const isTrip = a.type === 'trip'
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <div style={{ width: 34, height: 34, borderRadius: 8, background: isTrip ? 'rgba(0,255,136,0.08)' : 'rgba(0,212,255,0.08)', border: isTrip ? '1px solid rgba(0,255,136,0.2)' : '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{isTrip ? '🚛' : '⛽'}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 600, fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {a.driver} <span style={{ color: 'rgba(226,232,240,0.35)', fontWeight: 400 }}>· {a.plate}</span>
                                            </p>
                                            <p style={{ fontSize: 10, color: 'rgba(226,232,240,0.3)', marginTop: 2 }}>
                                                {new Date(a.logged_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: isTrip ? '#00FF88' : '#00D4FF', flexShrink: 0 }}>
                                            {isTrip ? '+800' : `-${fmt(a.amount)}`} ETB
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <Pagination current={actPage} total={actPages} onChange={setActPage} />
                    </div>
                )}
            </div>
        </div>
    )
}