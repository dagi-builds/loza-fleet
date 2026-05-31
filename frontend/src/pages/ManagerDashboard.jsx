import { useState, useEffect, useCallback } from 'react'
import {
    getFleet, getActivity, getOwnerRequests,
    approveRequest, denyRequest,
    getOwnerTripRequests, approveTripRequest, denyTripRequest,
    createDriver
} from '../api/fleetApi'

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
            <p style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'rgba(226,232,240,0.35)', marginBottom: 8
            }}>{label}</p>
            <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: '#fff', lineHeight: 1 }}>
                {value}
                {unit && <span style={{
                    fontSize: 11, color: 'rgba(226,232,240,0.4)',
                    marginLeft: 5, fontFamily: "'Rajdhani',sans-serif"
                }}>{unit}</span>}
            </p>
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

    const refresh = useCallback(async () => {
        try {
            const [fleet, act, reqs, trips] = await Promise.all([
                getFleet(), getActivity(), getOwnerRequests(), getOwnerTripRequests()
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

    const TABS = [
        { key: 'fleet', label: '📊 Fleet' },
        { key: 'requests', label: `📋 Requests${pendingReqs > 0 ? ` (${pendingReqs})` : ''}` },
        { key: 'trips', label: `🚛 Trips${pendingTrips > 0 ? ` (${pendingTrips})` : ''}` },
        { key: 'drivers', label: '➕ Add Driver' },
        { key: 'activity', label: '📜 Activity' },
    ]

    return (
        <div style={{
            minHeight: '100vh', background: '#020B18',
            backgroundImage: `linear-gradient(rgba(0,212,255,0.018) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,212,255,0.018) 1px, transparent 1px)`,
            backgroundSize: '44px 44px',
        }}>
            <div className="et-bar" />

            {/* Header */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 24px', borderBottom: '1px solid rgba(0,212,255,0.1)',
                background: 'rgba(4,20,40,0.9)',
            }}>
                <div>
                    <h1 style={{
                        fontFamily: "'Bebas Neue',sans-serif", fontSize: 26,
                        color: '#fff', letterSpacing: '0.04em', lineHeight: 1
                    }}>
                        LOZA <span style={{ color: '#00D4FF' }}>MANAGER</span>
                    </h1>
                    <p style={{
                        fontSize: 9, color: 'rgba(226,232,240,0.3)', fontWeight: 600,
                        letterSpacing: '0.16em', textTransform: 'uppercase'
                    }}>
                        {manager?.name} · Updated {lastUpdate}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={refresh} style={{
                        background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
                        color: '#00D4FF', fontFamily: "'Rajdhani',sans-serif",
                        fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                        padding: '8px 14px', borderRadius: 7, cursor: 'pointer',
                    }}>↻</button>
                    <button onClick={onLogout} style={{
                        background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)',
                        color: '#FF4757', fontFamily: "'Rajdhani',sans-serif",
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                        padding: '8px 14px', borderRadius: 6, cursor: 'pointer',
                    }}>Logout</button>
                </div>
            </div>

            {/* KPI cards — net profit hidden */}
            <div style={{
                padding: '20px 24px 0',
                display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10
            }}>
                <KpiCard label="Fleet Trips" value={fmt(totalTrips)} topColor="#94a3b8" />
                <KpiCard label="Fuel Cost" value={fmt(totalFuel)} unit="ETB" topColor="#00D4FF" />
                <KpiCard label="Bonus Paid" value={fmt(totalBonus)} unit="ETB" topColor="#F5A623" />
            </div>

            {/* Manager notice */}
            <div style={{
                margin: '12px 24px 0',
                background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)',
                borderRadius: 8, padding: '10px 14px',
                fontSize: 12, color: 'rgba(0,212,255,0.7)', fontWeight: 600,
            }}>
                👨‍💼 Manager View — Net profit and settings are restricted to owner only
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex', margin: '16px 0 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(4,20,40,0.5)', overflowX: 'auto',
            }}>
                {TABS.map(({ key, label }) => (
                    <button key={key} onClick={() => setTab(key)} style={{
                        padding: '12px 16px', whiteSpace: 'nowrap',
                        fontFamily: "'Rajdhani',sans-serif",
                        fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                        color: tab === key ? '#00D4FF' : 'rgba(226,232,240,0.3)',
                        background: 'none', border: 'none',
                        borderBottom: tab === key ? '2px solid #00D4FF' : '2px solid transparent',
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}>{label}</button>
                ))}
            </div>

            <div style={{ padding: '24px' }}>

                {/* FLEET TAB */}
                {tab === 'fleet' && (
                    loading ? (
                        <div style={{
                            textAlign: 'center', padding: 48,
                            color: 'rgba(226,232,240,0.3)', fontFamily: "'Rajdhani',sans-serif",
                            fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase'
                        }}>
                            Loading...
                        </div>
                    ) : (
                        <div style={{
                            background: 'rgba(4,20,40,0.85)',
                            border: '1px solid rgba(0,212,255,0.12)', borderRadius: 12, overflow: 'hidden'
                        }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(2,11,24,0.9)' }}>
                                            {['Driver', 'Vehicle', 'Trips', 'Fuel (ETB)', 'Bonus'].map((h, i) => (
                                                <th key={h} style={{
                                                    padding: '13px 18px',
                                                    fontFamily: "'Rajdhani',sans-serif",
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
                                            <tr key={d.id} style={{
                                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                                transition: 'background 0.2s',
                                                animationDelay: `${i * 0.05}s`
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.03)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{
                                                            width: 34, height: 34, borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.05))',
                                                            border: '1px solid rgba(0,212,255,0.25)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: '#00D4FF',
                                                        }}>{d.name.charAt(0)}</div>
                                                        <div>
                                                            <p style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>{d.name}</p>
                                                            <p style={{
                                                                fontSize: 10, color: 'rgba(226,232,240,0.35)',
                                                                fontFamily: "'JetBrains Mono',monospace", marginTop: 1
                                                            }}>{d.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 18px' }}>
                                                    <span style={{
                                                        fontFamily: "'JetBrains Mono',monospace",
                                                        fontSize: 12, fontWeight: 600, color: '#F5A623',
                                                        background: 'rgba(245,166,35,0.08)',
                                                        border: '1px solid rgba(245,166,35,0.2)',
                                                        padding: '3px 8px', borderRadius: 4
                                                    }}>{d.plate}</span>
                                                </td>
                                                <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                                                    <span style={{
                                                        background: 'rgba(255,255,255,0.06)',
                                                        padding: '4px 12px', borderRadius: 6,
                                                        fontWeight: 700, fontSize: 14, color: '#fff'
                                                    }}>
                                                        {fmt(d.trips)}
                                                    </span>
                                                </td>
                                                <td style={{
                                                    padding: '14px 18px', textAlign: 'center',
                                                    fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: '#00D4FF'
                                                }}>
                                                    {fmt(d.fuel)}
                                                </td>
                                                <td style={{
                                                    padding: '14px 18px', textAlign: 'center',
                                                    fontFamily: "'JetBrains Mono',monospace",
                                                    fontSize: 13, fontWeight: 700, color: '#F5A623'
                                                }}>
                                                    {fmt(d.bonus)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                )}

                {/* REQUESTS TAB */}
                {tab === 'requests' && (
                    <div className="anim-fade-up">
                        <h3 style={{
                            fontFamily: "'Bebas Neue',sans-serif", fontSize: 24,
                            color: '#fff', letterSpacing: '0.06em', marginBottom: 20
                        }}>
                            DRIVER REQUESTS
                        </h3>
                        {requests.length === 0 ? (
                            <div style={{
                                textAlign: 'center', padding: 48,
                                color: 'rgba(226,232,240,0.25)', fontFamily: "'Rajdhani',sans-serif",
                                fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase'
                            }}>
                                No requests yet
                            </div>
                        ) : requests.map(r => (
                            <div key={r._id} style={{
                                background: 'rgba(4,20,40,0.9)', border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 12, padding: '18px', marginBottom: 12,
                            }}>
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'flex-start', marginBottom: 12
                                }}>
                                    <div>
                                        <p style={{
                                            fontFamily: "'Bebas Neue',sans-serif", fontSize: 18,
                                            color: '#fff', letterSpacing: '0.04em'
                                        }}>
                                            {REQ_LABELS[r.type] || r.type}
                                        </p>
                                        <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.5)', marginTop: 2 }}>
                                            {r.driverName} · {r.plate}
                                        </p>
                                        <p style={{
                                            fontSize: 11, color: 'rgba(226,232,240,0.3)',
                                            fontFamily: "'JetBrains Mono',monospace", marginTop: 2
                                        }}>
                                            📱 {r.phone} · {new Date(r.createdAt).toLocaleDateString()}
                                        </p>
                                        {r.description && (
                                            <p style={{
                                                fontSize: 12, color: 'rgba(226,232,240,0.4)',
                                                marginTop: 6, fontStyle: 'italic'
                                            }}>"{r.description}"</p>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{
                                            fontFamily: "'Bebas Neue',sans-serif",
                                            fontSize: 22, color: '#F5A623'
                                        }}>
                                            {fmt(r.amount)} ETB
                                        </p>
                                        <span style={{
                                            background: statusBg[r.status], color: statusColor[r.status],
                                            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                                            textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4,
                                            border: `1px solid ${statusColor[r.status]}40`,
                                        }}>{r.status}</span>
                                    </div>
                                </div>
                                {r.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => handleApprove(r._id)} style={{
                                            flex: 1, padding: '10px',
                                            background: 'linear-gradient(135deg, #00C853, #00E676)',
                                            color: '#020B18', fontFamily: "'Bebas Neue',sans-serif",
                                            fontSize: 16, letterSpacing: '0.06em', borderRadius: 8,
                                            border: 'none', cursor: 'pointer',
                                        }}>✓ APPROVE</button>
                                        <button onClick={() => handleDeny(r._id)} style={{
                                            flex: 1, padding: '10px',
                                            background: 'rgba(255,71,87,0.1)',
                                            border: '1px solid rgba(255,71,87,0.3)',
                                            color: '#FF4757', fontFamily: "'Bebas Neue',sans-serif",
                                            fontSize: 16, letterSpacing: '0.06em', borderRadius: 8, cursor: 'pointer',
                                        }}>✗ DENY</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* TRIPS TAB */}
                {tab === 'trips' && (
                    <div className="anim-fade-up">
                        <h3 style={{
                            fontFamily: "'Bebas Neue',sans-serif", fontSize: 24,
                            color: '#fff', letterSpacing: '0.06em', marginBottom: 20
                        }}>
                            TRIP APPROVALS
                        </h3>
                        {tripReqs.length === 0 ? (
                            <div style={{
                                textAlign: 'center', padding: 48,
                                color: 'rgba(226,232,240,0.25)', fontFamily: "'Rajdhani',sans-serif",
                                fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase'
                            }}>
                                No trip requests yet
                            </div>
                        ) : tripReqs.map(r => (
                            <div key={r._id} style={{
                                background: 'rgba(4,20,40,0.9)', border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 12, padding: '18px', marginBottom: 12,
                            }}>
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'flex-start', marginBottom: 12
                                }}>
                                    <div>
                                        <p style={{
                                            fontFamily: "'Bebas Neue',sans-serif", fontSize: 18,
                                            color: '#fff', letterSpacing: '0.04em'
                                        }}>🚛 Trip Request</p>
                                        <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.5)', marginTop: 2 }}>
                                            {r.driverName} · {r.plate}
                                        </p>
                                        <p style={{
                                            fontSize: 11, color: 'rgba(226,232,240,0.3)',
                                            fontFamily: "'JetBrains Mono',monospace", marginTop: 2
                                        }}>
                                            {new Date(r.createdAt).toLocaleString()}
                                        </p>
                                        {r.note && (
                                            <p style={{
                                                fontSize: 12, color: 'rgba(226,232,240,0.4)',
                                                marginTop: 6, fontStyle: 'italic'
                                            }}>"{r.note}"</p>
                                        )}
                                    </div>
                                    <span style={{
                                        background: statusBg[r.status], color: statusColor[r.status],
                                        fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
                                        textTransform: 'uppercase', padding: '4px 10px', borderRadius: 4,
                                        border: `1px solid ${statusColor[r.status]}40`,
                                    }}>{r.status}</span>
                                </div>
                                {r.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => handleApproveTrip(r._id)} style={{
                                            flex: 1, padding: '10px',
                                            background: 'linear-gradient(135deg, #00C853, #00E676)',
                                            color: '#020B18', fontFamily: "'Bebas Neue',sans-serif",
                                            fontSize: 16, letterSpacing: '0.06em', borderRadius: 8,
                                            border: 'none', cursor: 'pointer',
                                        }}>✓ APPROVE TRIP</button>
                                        <button onClick={() => handleDenyTrip(r._id)} style={{
                                            flex: 1, padding: '10px',
                                            background: 'rgba(255,71,87,0.1)',
                                            border: '1px solid rgba(255,71,87,0.3)',
                                            color: '#FF4757', fontFamily: "'Bebas Neue',sans-serif",
                                            fontSize: 16, letterSpacing: '0.06em', borderRadius: 8, cursor: 'pointer',
                                        }}>✗ DENY</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ADD DRIVER TAB */}
                {tab === 'drivers' && (
                    <div className="anim-fade-up" style={{ maxWidth: 480 }}>
                        <h3 style={{
                            fontFamily: "'Bebas Neue',sans-serif", fontSize: 24,
                            color: '#fff', letterSpacing: '0.06em', marginBottom: 20
                        }}>
                            ADD / UPDATE DRIVER
                        </h3>

                        {addSuccess && (
                            <div style={{
                                background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)',
                                borderRadius: 8, padding: '12px 16px', marginBottom: 20,
                                fontSize: 14, fontWeight: 600, color: '#00FF88', textAlign: 'center',
                            }}>✅ Driver saved successfully!</div>
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
                                    <label style={{
                                        display: 'block', fontSize: 10, fontWeight: 700,
                                        letterSpacing: '0.14em', textTransform: 'uppercase',
                                        color: 'rgba(0,212,255,0.55)', marginBottom: 6
                                    }}>{f.label}</label>
                                    <input
                                        className="input-field"
                                        type={f.key === 'pin' ? 'password' : 'text'}
                                        placeholder={f.placeholder}
                                        value={driverForm[f.key]}
                                        onChange={e => setDriverForm(p => ({ ...p, [f.key]: e.target.value }))}
                                    />
                                </div>
                            ))}

                            <button onClick={handleAddDriver} disabled={addLoading} style={{
                                background: addLoading ? 'rgba(0,212,255,0.3)' : 'linear-gradient(135deg, #00D4FF, #0277BD)',
                                color: '#020B18', fontFamily: "'Bebas Neue',sans-serif",
                                fontSize: 20, letterSpacing: '0.1em',
                                padding: '14px', borderRadius: 8, border: 'none',
                                cursor: addLoading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 6px 25px rgba(0,212,255,0.25)',
                            }}>
                                {addLoading ? 'SAVING...' : 'SAVE DRIVER'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ACTIVITY TAB */}
                {tab === 'activity' && (
                    <div className="anim-fade-up">
                        <h3 style={{
                            fontFamily: "'Bebas Neue',sans-serif", fontSize: 24,
                            color: '#fff', letterSpacing: '0.06em', marginBottom: 20
                        }}>
                            ACTIVITY LOG
                        </h3>
                        <div style={{
                            background: 'rgba(4,20,40,0.85)',
                            border: '1px solid rgba(0,212,255,0.1)', borderRadius: 12, overflow: 'hidden'
                        }}>
                            {activity.length === 0 ? (
                                <p style={{
                                    textAlign: 'center', padding: 48,
                                    color: 'rgba(226,232,240,0.25)', fontFamily: "'Rajdhani',sans-serif",
                                    fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase'
                                }}>
                                    No activity yet
                                </p>
                            ) : activity.map((a, i) => {
                                const isTrip = a.type === 'trip'
                                return (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px',
                                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                                        transition: 'background 0.2s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.03)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 8,
                                            background: isTrip ? 'rgba(0,255,136,0.08)' : 'rgba(0,212,255,0.08)',
                                            border: isTrip ? '1px solid rgba(0,255,136,0.2)' : '1px solid rgba(0,212,255,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 16, flexShrink: 0,
                                        }}>{isTrip ? '🚛' : '⛽'}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{
                                                fontWeight: 600, fontSize: 14, color: '#fff',
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                            }}>
                                                {a.driver}
                                                <span style={{
                                                    color: 'rgba(226,232,240,0.35)',
                                                    fontWeight: 400
                                                }}> · {a.plate}</span>
                                            </p>
                                            <p style={{
                                                fontSize: 10, color: 'rgba(226,232,240,0.3)',
                                                fontFamily: "'JetBrains Mono',monospace", marginTop: 2
                                            }}>
                                                {new Date(a.logged_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div style={{
                                            fontFamily: "'JetBrains Mono',monospace",
                                            fontSize: 13, fontWeight: 600,
                                            color: isTrip ? '#00FF88' : '#00D4FF', flexShrink: 0
                                        }}>
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