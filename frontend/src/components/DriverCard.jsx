export default function DriverCard({ driver }) {
  return (
    <div className="anim-fade-up" style={{
      background: 'linear-gradient(135deg, rgba(245,166,35,0.08) 0%, rgba(4,20,40,0.95) 60%)',
      border: '1px solid rgba(245,166,35,0.25)',
      borderRadius: 14, padding: 20, marginBottom: 20,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Corner accents */}
      <div style={{
        position: 'absolute', top: 10, left: 10, width: 14, height: 14,
        borderTop: '1.5px solid rgba(245,166,35,0.5)',
        borderLeft: '1.5px solid rgba(245,166,35,0.5)'
      }} />
      <div style={{
        position: 'absolute', bottom: 10, right: 10, width: 14, height: 14,
        borderBottom: '1.5px solid rgba(245,166,35,0.5)',
        borderRight: '1.5px solid rgba(245,166,35,0.5)'
      }} />

      <div className="et-bar" style={{ marginBottom: 16 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{
            fontSize: 10, color: 'rgba(245,166,35,0.6)', fontWeight: 600,
            letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4
          }}>
            Active Operator
          </p>
          <h3 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 28, color: '#fff', letterSpacing: '0.04em', lineHeight: 1,
            textShadow: '0 0 20px rgba(245,166,35,0.3)',
          }}>
            {driver.name}
          </h3>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(0,255,136,0.08)',
          border: '1px solid rgba(0,255,136,0.25)',
          borderRadius: 6, padding: '4px 10px',
        }}>
          <span className="anim-pulse-ring" style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#00FF88', display: 'block', flexShrink: 0
          }} />
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#00FF88'
          }}>Live</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <span style={{
          background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.35)',
          color: '#F5A623', fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 5
        }}>{driver.plate}</span>
        <span style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(226,232,240,0.6)', fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12, padding: '4px 12px', borderRadius: 5
        }}>{driver.id}</span>
      </div>
    </div>
  )
}