import { useState, useEffect } from 'react'
import { logTrip, logFuel, submitRequest, getDriverRequests } from '../api/fleetApi'
import DriverCard from '../components/DriverCard'
import TripButton from '../components/TripButton'

function fmt(n) { return Number(n).toLocaleString() }
function fmtDate(d) {
    return new Date(d).toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

const REQUEST_TYPES = [
    { value: 'fuel', label: '⛽ Fuel Money', color: '#00D4FF' },
    { value: 'repair', label: '🔧 Repair / Maintenance', color: '#FF4757' },
    { value: 'other', label: '📋 Other Request', color: '#9b59b6' },
]

const statusColor = { pending: '#F5A623', approved: '#00FF88', denied: '#FF4757' }
const statusBg = { pending: 'rgba(245,166,35,0.1)', approved: 'rgba(0,255,136,0.1)', denied: 'rgba(255,71,87,0.1)' }

export default function DriverDashboard({ driver: initialDriver, onLogout }) {
    const [driver, setDriver] = useState(initialDriver)
    const [tab, setTab] = useState('shift')
    const [fuelAmt, setFuelAmt] = useState('')
    const [showFuel, setShowFuel] = useState(false)
    const [actionLoading, setActionLoading] = useState('')
    const [requests, setRequests] = useState([])
    const [reqType, setReqType] = useState('fuel')
    const [reqAmount, setReqAmount] = useState('')
    const [reqDesc, setReqDesc] = useState('')
    const [reqPhone, setReqPhone] = useState('')
    const [reqLoading, setReqLoading] = useState(false)
    const [reqSuccess, setReqSuccess] = useState(false)
    const [tripLogs, setTripLogs] = useState([])

    // pagination
    const [reqPage, setReqPage] = useState(1)
    const PER_PAGE = 5

    useEffect(() => { loadRequests() }, [])

    async function loadRequests() {
        try {
            const data = await getDriverRequests(driver.id)
            setRequests(data)
        } catch (e) { }
    }

    async function handleTrip() {
        setActionLoading('trip')
        try {
            await logTrip(driver.id)
            const now = new Date()
            setDriver(p => ({ ...p, trips: Number(p.trips) + 1, profit: Number(p.profit) + 800, bonus: Number(p.bonus) + 50 }))
            setTripLogs(prev => [{ time: now.toLocaleTimeString(), date: now.toLocaleDateString() }, ...prev])
        } catch (e) { alert(e.message) }
        finally { setActionLoading('') }
    }

    async function handleFuel() {
        const amount = parseFloat(fuelAmt)
        if (!fuelAmt || isNaN(amount) || amount <= 0) { alert('Enter valid amount'); return }
        setActionLoading('fuel')
        try {
            await logFuel(driver.id, amount)
            setDriver(p => ({ ...p, fuel: Number(p.fuel) + amount }))
            setFuelAmt(''); setShowFuel(false)
        } catch (e) { alert(e.message) }
        finally { setActionLoading('') }
    }

    async function handleRequest() {
        if (!reqAmount || !reqPhone) { alert('Amount and phone are required'); return }
        setReqLoading(true)
        try {
            await submitRequest({
                driverId: driver.id, type: reqType,
                amount: parseFloat(reqAmount), description: reqDesc, phone: reqPhone,
            })
            setReqSuccess(true)
            setReqAmount(''); setReqDesc(''); setReqPhone('')
            await loadRequests()
            setTimeout(() => setReqSuccess(false), 3000)
        } catch (e) { alert(e.message) }
        finally { setReqLoading(false) }
    }

    const net = Number(driver.profit) - Number(driver.fuel)

    // paginated requests
    const totalPages = Math.ceil(requests.length / PER_PAGE)
    const paginatedRequests = requests.slice((reqPage - 1) * PER_PAGE, reqPage * PER_PAGE)

    return (
        <div style={{
            minHeight: '100vh', background: '#020B18',
            backgroundImage: `
        linear-gradient(rgba(245,166,35,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(245,166,35,0.025) 1px, transparent 1px)`,
            backgroundSize: '44px 44px',
        }}>
            <div className="et-bar" />

            {/* Header */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 20px', borderBottom: '1px solid rgba(245,166,35,0.1)',
                background: 'rgba(4,20,40,0.8)',
            }}>
                <div>
                    <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: '#fff', letterSpacing: '0.06em', lineHeight: 1 }}>
                        DRIVER DASHBOARD
                    </h2>
                    <p style={{ fontSize: 10, color: 'rgba(226,232,240,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
                        {driver.name} · {driver.plate}
                    </p>
                </div>
                <button onClick={onLogout} style={{
                    background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)',
                    color: '#FF4757', fontFamily: "'Rajdhani', sans-serif",
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                    padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
                }}>Logout</button>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(4,20,40,0.5)',
            }}>
                {[['shift', '🚛 Shift'], ['request', '📋 Request'], ['history', '📜 History']].map(([t, label]) => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        flex: 1, padding: '13px 8px', whiteSpace: 'nowrap',
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: tab === t ? '#F5A623' : 'rgba(226,232,240,0.3)',
                        background: 'none', border: 'none',
                        borderBottom: tab === t ? '2px solid #F5A623' : '2px solid transparent',
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}>{label}</button>
                ))}
            </div>

            <div style={{ padding: '20px 16px', maxWidth: 600, margin: '0 auto' }}>

                {/* SHIFT TAB */}
                {tab === 'shift' && (
                    <div className="anim-fade-up">
                        <DriverCard driver={driver} />

                        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                            <TripButton type="trip" onClick={handleTrip} loading={actionLoading === 'trip'} />
                            <TripButton type="fuel" onClick={() => setShowFuel(s => !s)} loading={actionLoading === 'fuel'} />
                        </div>

                        {showFuel && (
                            <div className="anim-fade-in" style={{
                                background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)',
                                borderRadius: 10, padding: 16, marginBottom: 20,
                            }}>
                                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(0,212,255,0.6)', marginBottom: 10 }}>
                                    Fuel Receipt (ETB)
                                </p>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input type="number" placeholder="Amount e.g. 1500"
                                        value={fuelAmt} onChange={e => setFuelAmt(e.target.value)}
                                        className="input-field" style={{ flex: 1 }} />
                                    <button onClick={handleFuel} style={{
                                        background: 'linear-gradient(135deg,#0277BD,#00D4FF)',
                                        color: '#020B18', fontFamily: "'Bebas Neue', sans-serif",
                                        fontSize: 16, padding: '0 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                    }}>LOG</button>
                                </div>
                            </div>
                        )}

                        {/* Stats grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                            {[
                                { label: 'Trips', value: fmt(driver.trips), color: '#fff', border: 'rgba(148,163,184,0.25)' },
                                { label: 'Fuel (ETB)', value: fmt(driver.fuel), color: '#00D4FF', border: 'rgba(0,212,255,0.25)' },
                                { label: 'Bonus', value: fmt(driver.bonus), color: '#F5A623', border: 'rgba(245,166,35,0.25)' },
                                { label: 'Net Profit', value: fmt(net), color: net >= 0 ? '#00FF88' : '#FF4757', border: net >= 0 ? 'rgba(0,255,136,0.25)' : 'rgba(255,71,87,0.25)' },
                            ].map(s => (
                                <div key={s.label} style={{
                                    background: 'rgba(4,20,40,0.95)', border: `1px solid ${s.border}`,
                                    borderRadius: 10, padding: '16px', textAlign: 'center',
                                }}>
                                    <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: s.color, lineHeight: 1 }}>{s.value}</p>
                                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(226,232,240,0.35)', marginTop: 4 }}>{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Today's trip log */}
                        {tripLogs.length > 0 && (
                            <div style={{ background: 'rgba(4,20,40,0.9)', border: '1px solid rgba(245,166,35,0.1)', borderRadius: 10, padding: 16 }}>
                                <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: '#F5A623', letterSpacing: '0.1em', marginBottom: 12 }}>
                                    TODAY'S TRIPS
                                </p>
                                {tripLogs.map((t, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < tripLogs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                        <span style={{ color: '#00FF88', fontSize: 13, fontWeight: 600 }}>🚛 Trip #{tripLogs.length - i}</span>
                                        <span style={{ color: 'rgba(226,232,240,0.4)', fontSize: 12 }}>{t.time}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* REQUEST TAB */}
                {tab === 'request' && (
                    <div className="anim-fade-up">
                        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#fff', letterSpacing: '0.06em', marginBottom: 20 }}>
                            SUBMIT A REQUEST
                        </h3>

                        {reqSuccess && (
                            <div style={{
                                background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)',
                                borderRadius: 8, padding: '12px 16px', marginBottom: 20,
                                fontSize: 14, fontWeight: 600, color: '#00FF88', textAlign: 'center',
                            }}>✅ Request submitted! Waiting for owner approval.</div>
                        )}

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,166,35,0.55)', marginBottom: 8 }}>
                                Request Type
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {REQUEST_TYPES.map(rt => (
                                    <button key={rt.value} onClick={() => setReqType(rt.value)} style={{
                                        padding: '14px 16px', borderRadius: 8, textAlign: 'left',
                                        border: reqType === rt.value ? `2px solid ${rt.color}` : '1px solid rgba(255,255,255,0.08)',
                                        background: reqType === rt.value ? `${rt.color}15` : 'rgba(4,20,40,0.8)',
                                        color: reqType === rt.value ? rt.color : 'rgba(226,232,240,0.5)',
                                        fontFamily: "'Rajdhani', sans-serif",
                                        fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                    }}>{rt.label}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: 14 }}>
                            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,166,35,0.55)', marginBottom: 6 }}>
                                Amount (ETB)
                            </label>
                            <input type="number" placeholder="e.g. 2000"
                                value={reqAmount} onChange={e => setReqAmount(e.target.value)}
                                className="input-field" />
                        </div>

                        <div style={{ marginBottom: 14 }}>
                            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,166,35,0.55)', marginBottom: 6 }}>
                                Your Phone Number
                            </label>
                            <input type="text" placeholder="e.g. 0911234567"
                                value={reqPhone} onChange={e => setReqPhone(e.target.value)}
                                className="input-field" />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,166,35,0.55)', marginBottom: 6 }}>
                                Description (optional)
                            </label>
                            <textarea placeholder="Describe your request..."
                                value={reqDesc} onChange={e => setReqDesc(e.target.value)}
                                rows={3} style={{
                                    width: '100%', background: 'rgba(2,11,24,0.9)',
                                    border: '1px solid rgba(245,166,35,0.2)', color: '#fff',
                                    fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 500,
                                    padding: '13px 16px', borderRadius: 8, outline: 'none', resize: 'vertical',
                                    boxSizing: 'border-box',
                                }} />
                        </div>

                        <button onClick={handleRequest} disabled={reqLoading} style={{
                            width: '100%',
                            background: reqLoading ? 'rgba(245,166,35,0.3)' : 'linear-gradient(135deg, #F5A623, #FFD166)',
                            color: '#020B18', fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: 20, letterSpacing: '0.1em',
                            padding: '14px', borderRadius: 8, border: 'none',
                            cursor: reqLoading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 6px 25px rgba(245,166,35,0.3)',
                        }}>
                            {reqLoading ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
                        </button>
                    </div>
                )}

                {/* HISTORY TAB */}
                {tab === 'history' && (
                    <div className="anim-fade-up">
                        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#fff', letterSpacing: '0.06em', marginBottom: 20 }}>
                            MY REQUESTS
                        </h3>
                        {requests.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 48, color: 'rgba(226,232,240,0.25)', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                No requests yet
                            </div>
                        ) : (
                            <>
                                {paginatedRequests.map((r) => (
                                    <div key={r._id} style={{
                                        background: 'rgba(4,20,40,0.9)', border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: 10, padding: '16px', marginBottom: 10,
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                            <div>
                                                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: '#fff', letterSpacing: '0.04em' }}>
                                                    {REQUEST_TYPES.find(t => t.value === r.type)?.label || r.type}
                                                </p>
                                                <p style={{ fontSize: 11, color: 'rgba(226,232,240,0.3)', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                                                    {fmtDate(r.createdAt)}
                                                </p>
                                            </div>
                                            <span style={{
                                                background: statusBg[r.status], color: statusColor[r.status],
                                                fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                                                textTransform: 'uppercase', padding: '4px 10px', borderRadius: 4,
                                                border: `1px solid ${statusColor[r.status]}40`,
                                            }}>{r.status}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.4)' }}>{r.description || 'No description'}</p>
                                            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: '#F5A623' }}>
                                                {Number(r.amount).toLocaleString()} ETB
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                                        <button onClick={() => setReqPage(p => Math.max(1, p - 1))} disabled={reqPage === 1} style={{
                                            padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(245,166,35,0.2)',
                                            background: 'rgba(4,20,40,0.9)', color: reqPage === 1 ? 'rgba(226,232,240,0.2)' : '#F5A623',
                                            cursor: reqPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 700,
                                        }}>←</button>
                                        <span style={{ color: 'rgba(226,232,240,0.4)', fontSize: 13, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                                            {reqPage} / {totalPages}
                                        </span>
                                        <button onClick={() => setReqPage(p => Math.min(totalPages, p + 1))} disabled={reqPage === totalPages} style={{
                                            padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(245,166,35,0.2)',
                                            background: 'rgba(4,20,40,0.9)', color: reqPage === totalPages ? 'rgba(226,232,240,0.2)' : '#F5A623',
                                            cursor: reqPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 700,
                                        }}>→</button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}