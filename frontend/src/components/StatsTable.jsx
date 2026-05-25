function fmt(n) { return Number(n).toLocaleString() }

export default function StatsTable({ drivers }) {
  if (!drivers.length) {
    return (
      <div style={{
        background: 'rgba(4,20,40,0.8)', border: '1px solid rgba(245,166,35,0.1)',
        borderRadius: 12, padding: '48px 24px', textAlign: 'center',
        color: 'rgba(226,232,240,0.3)',
        fontFamily: "'Rajdhani', sans-serif", fontSize: 15,
      }}>
        No drivers yet — they will appear once they log in.
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(4,20,40,0.85)',
      border: '1px solid rgba(245,166,35,0.12)',
      borderRadius: 12, overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ background: 'rgba(2,11,24,0.9)' }}>
              {['Driver', 'Vehicle', 'Trips', 'Fuel (ETB)', 'Bonus', 'Net Profit'].map((h, i) => (
                <th key={h} style={{
                  padding: '13px 18px',
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'rgba(245,166,35,0.6)',
                  borderBottom: '1px solid rgba(245,166,35,0.1)',
                  textAlign: i >= 2 ? 'center' : 'left',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drivers.map((d, i) => {
              const net = Number(d.profit) - Number(d.fuel)
              return (
                <tr key={d.id} className="premium-row anim-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(245,166,35,0.2), rgba(245,166,35,0.05))',
                        border: '1px solid rgba(245,166,35,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 16, color: '#F5A623', flexShrink: 0,
                      }}>
                        {d.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>{d.name}</p>
                        <p style={{
                          fontSize: 10, color: 'rgba(226,232,240,0.35)',
                          fontFamily: "'JetBrains Mono', monospace", marginTop: 1
                        }}>{d.id}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12, fontWeight: 600, color: '#F5A623',
                      background: 'rgba(245,166,35,0.08)',
                      border: '1px solid rgba(245,166,35,0.2)',
                      padding: '3px 8px', borderRadius: 4,
                    }}>{d.plate}</span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                    <span style={{
                      background: 'rgba(255,255,255,0.06)',
                      padding: '4px 12px', borderRadius: 6,
                      fontWeight: 700, fontSize: 14, color: '#fff',
                    }}>{fmt(d.trips)}</span>
                  </td>
                  <td style={{
                    padding: '14px 18px', textAlign: 'center',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#00D4FF'
                  }}>
                    {fmt(d.fuel)}
                  </td>
                  <td style={{
                    padding: '14px 18px', textAlign: 'center',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13, fontWeight: 700, color: '#F5A623'
                  }}>
                    {fmt(d.bonus)}
                  </td>
                  <td style={{
                    padding: '14px 18px', textAlign: 'center',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700,
                    color: net >= 0 ? '#00FF88' : '#FF4757'
                  }}>
                    {net >= 0 ? '+' : ''}{fmt(net)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}