import { useState, useEffect } from 'react'
import { getDriverHistory } from '../api/fleetApi'

function fmt(n) { return Number(n).toLocaleString() }
function fmtDate(d) {
    return new Date(d).toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

export default function DriverHistoryPage({ driver, onBack }) {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        getDriverHistory(driver.id)
            .then(setHistory)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [driver.id])

    const trips = history.filter(h => h.type === 'trip').length
    const totalFuel = history.filter(h => h.type === 'fuel').reduce((s, h) => s + h.amount, 0)
    const totalEarned = trips * 800

    return (
        <div style={{ height: '100%', overflowY: 'auto', padding: 24, background: '#020B18' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <button onClick={onBack} style={{
                    background: 'none', border: '1px solid rgba(245,166,35,0.2)',
                    color: 'rgba(226,232,240,0.5)', borderRadius: 6,
                    padding: '6px 14px', cursor: 'pointer', fontSize: 12,
                    fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>← Back</button>
                <div>
                    <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: '#fff', letterSpacing: '0.08em' }}>
                        {driver.name}
                    </h1>
                    <p style={{ fontSize: 11, color: 'rgba(226,232,240,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {driver.plate} · Full History
                    </p>
                </div>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                {[
                    { label: 'Total Trips', value: trips, color: '#fff' },
                    { label: 'Fuel Spent', value: `${fmt(totalFuel)} ETB`, color: '#00D4FF' },
                    { label: 'Earned', value: `${fmt(totalEarned)} ETB`, color: '#00FF88' },
                ].map(s => (
                    <div key={s.label} style={{
                        background: 'rgba(4,20,40,0.95)',
                        border: '1px solid rgba(245,166,35,0.12)',
                        borderRadius: 10, padding: '14px 12px', textAlign: 'center',
                    }}>
                        <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: s.color, lineHeight: 1 }}>{s.value}</p>
                        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(226,232,240,0.35)', marginTop: 4 }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* History list */}
            {loading && <p style={{ color: 'rgba(226,232,240,0.4)', textAlign: 'center' }}>Loading...</p>}
            {error && <p style={{ color: '#FF4757', textAlign: 'center' }}>⚠ {error}</p>}
            {!loading && history.length === 0 && (
                <p style={{ color: 'rgba(226,232,240,0.3)', textAlign: 'center', marginTop: 40, fontFamily: "'Rajdhani',sans-serif", letterSpacing: '0.08em' }}>NO HISTORY YET</p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {history.map((h, i) => (
                    <div key={i} style={{
                        background: 'rgba(4,20,40,0.9)',
                        border: `1px solid ${h.type === 'trip' ? 'rgba(245,166,35,0.15)' : 'rgba(0,212,255,0.15)'}`,
                        borderRadius: 10, padding: '12px 16px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 20 }}>{h.type === 'trip' ? '🚛' : '⛽'}</span>
                            <div>
                                <p style={{
                                    fontFamily: "'Bebas Neue',sans-serif", fontSize: 15,
                                    color: h.type === 'trip' ? '#F5A623' : '#00D4FF',
                                    letterSpacing: '0.06em',
                                }}>
                                    {h.type === 'trip' ? 'TRIP LOGGED' : 'FUEL LOGGED'}
                                </p>
                                <p style={{ fontSize: 11, color: 'rgba(226,232,240,0.35)', marginTop: 2 }}>
                                    {fmtDate(h.date)}
                                </p>
                            </div>
                        </div>
                        <p style={{
                            fontFamily: "'Bebas Neue',sans-serif", fontSize: 18,
                            color: h.type === 'trip' ? '#00FF88' : '#FF4757',
                        }}>
                            {h.type === 'trip' ? '+' : '-'}{fmt(h.amount)} ETB
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}