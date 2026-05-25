export default function TripButton({ type, onClick, loading }) {
  const cfg = {
    trip: {
      label: '+ TRIP', sub: 'Log Delivery',
      bg: 'linear-gradient(135deg, #00C853 0%, #00E676 100%)',
      shadow: '0 6px 25px rgba(0,200,83,0.35)',
      hover: '0 10px 35px rgba(0,230,118,0.45)',
    },
    fuel: {
      label: '+ FUEL', sub: 'Log Receipt',
      bg: 'linear-gradient(135deg, #0277BD 0%, #00D4FF 100%)',
      shadow: '0 6px 25px rgba(0,212,255,0.25)',
      hover: '0 10px 35px rgba(0,212,255,0.4)',
    },
  }[type]

  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = cfg.hover; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = cfg.shadow; e.currentTarget.style.transform = 'translateY(0)' }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
      onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
      style={{
        flex: 1, padding: '28px 12px', borderRadius: 12, border: 'none',
        background: cfg.bg, boxShadow: cfg.shadow,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.55 : 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 4,
        transition: 'all 0.2s',
      }}
    >
      <span style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 30, letterSpacing: '0.04em',
        color: '#020B18', lineHeight: 1,
      }}>
        {loading ? '...' : cfg.label}
      </span>
      <span style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: 10, fontWeight: 700,
        letterSpacing: '0.15em', textTransform: 'uppercase',
        color: 'rgba(2,11,24,0.65)',
      }}>
        {cfg.sub}
      </span>
    </button>
  )
}