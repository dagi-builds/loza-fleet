import { useState, useEffect } from 'react'
import { getChartStats } from '../api/fleetApi'
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

export default function ChartsPage({ onBack }) {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        getChartStats()
            .then(setStats)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [])

    const cardStyle = {
        background: 'rgba(4,20,40,0.95)',
        border: '1px solid rgba(245,166,35,0.15)',
        borderRadius: 12, padding: 24, marginBottom: 24,
    }

    const titleStyle = {
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 18, color: '#F5A623',
        letterSpacing: '0.1em', marginBottom: 16,
    }

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(226,232,240,0.4)', fontFamily: "'Rajdhani',sans-serif" }}>
            Loading charts...
        </div>
    )

    if (error) return (
        <div style={{ padding: 24, color: '#FF4757' }}>⚠ {error}</div>
    )

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
                    FLEET ANALYTICS
                </h1>
            </div>

            {/* Daily Trips */}
            <div style={cardStyle}>
                <p style={titleStyle}>📈 DAILY TRIPS — LAST 7 DAYS</p>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={stats.dailyTrips}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,166,35,0.08)" />
                        <XAxis dataKey="date" tick={{ fill: 'rgba(226,232,240,0.4)', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'rgba(226,232,240,0.4)', fontSize: 10 }} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: '#041428', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 8 }} labelStyle={{ color: '#F5A623' }} itemStyle={{ color: '#fff' }} />
                        <Line type="monotone" dataKey="count" stroke="#F5A623" strokeWidth={2} dot={{ fill: '#F5A623', r: 4 }} name="Trips" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Daily Fuel Cost */}
            <div style={cardStyle}>
                <p style={titleStyle}>⛽ FUEL COST — LAST 7 DAYS (ETB)</p>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={stats.dailyFuel}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.08)" />
                        <XAxis dataKey="date" tick={{ fill: 'rgba(226,232,240,0.4)', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'rgba(226,232,240,0.4)', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: '#041428', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8 }} labelStyle={{ color: '#00D4FF' }} itemStyle={{ color: '#fff' }} />
                        <Line type="monotone" dataKey="amount" stroke="#00D4FF" strokeWidth={2} dot={{ fill: '#00D4FF', r: 4 }} name="Fuel (ETB)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Profit per Driver */}
            <div style={cardStyle}>
                <p style={titleStyle}>🏆 NET PROFIT PER DRIVER (ETB)</p>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={stats.profitPerDriver} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,136,0.08)" />
                        <XAxis type="number" tick={{ fill: 'rgba(226,232,240,0.4)', fontSize: 10 }} />
                        <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(226,232,240,0.6)', fontSize: 11 }} width={80} />
                        <Tooltip contentStyle={{ background: '#041428', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 8 }} labelStyle={{ color: '#00FF88' }} itemStyle={{ color: '#fff' }} />
                        <Legend wrapperStyle={{ color: 'rgba(226,232,240,0.4)', fontSize: 11 }} />
                        <Bar dataKey="profit" fill="rgba(245,166,35,0.7)" name="Gross (ETB)" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="net" fill="rgba(0,255,136,0.7)" name="Net (ETB)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}