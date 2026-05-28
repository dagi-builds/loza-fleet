export default function LandingPage({ onDriver, onOwner }) {
    return (
        <div style={{
            minHeight: '100vh', background: '#020B18',
            backgroundImage: `
        linear-gradient(rgba(245,166,35,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(245,166,35,0.025) 1px, transparent 1px)`,
            backgroundSize: '44px 44px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '24px', position: 'relative',
        }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 300,
                background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(245,166,35,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div className="et-bar" style={{ position: 'absolute', top: 0, left: 0, right: 0, borderRadius: 0 }} />

            <div className="anim-fade-up" style={{ textAlign: 'center', maxWidth: 420, width: '100%' }}>
                <div style={{
                    width: 80, height: 80,
                    background: 'linear-gradient(135deg, #F5A623, #FFD166)',
                    borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px', boxShadow: '0 12px 40px rgba(245,166,35,0.4)',
                }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: '#020B18' }}>LOZA</span>
                </div>

                <h1 style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: '0.06em',
                    color: '#fff', lineHeight: 1, textShadow: '0 0 30px rgba(245,166,35,0.3)', marginBottom: 8,
                }}>
                    LOZA <span style={{ color: '#F5A623' }}>FLEET</span>
                </h1>
                <p style={{
                    fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: 'rgba(226,232,240,0.3)', marginBottom: 48,
                }}>
                    Construction PLC · Fleet Command System
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Driver button */}
                    <button onClick={onDriver}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        style={{
                            background: 'linear-gradient(135deg, #00C853, #00E676)',
                            border: 'none', borderRadius: 12, padding: '22px 24px',
                            cursor: 'pointer', transition: 'all 0.2s',
                            boxShadow: '0 6px 25px rgba(0,200,83,0.3)',
                            display: 'flex', alignItems: 'center', gap: 16,
                        }}>
                        <span style={{ fontSize: 32 }}>🚛</span>
                        <div style={{ textAlign: 'left' }}>
                            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#020B18', letterSpacing: '0.06em' }}>
                                I AM A DRIVER
                            </p>
                            <p style={{ fontSize: 11, color: 'rgba(2,11,24,0.6)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                Log trips, fuel & requests
                            </p>
                        </div>
                    </button>

                    {/* Owner button — subtle, no label */}
                    <button onClick={onOwner}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        style={{
                            background: 'rgba(4,20,40,0.8)',
                            border: '1px solid rgba(245,166,35,0.2)',
                            borderRadius: 12, padding: '14px 24px',
                            cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        }}>
                        <span style={{ fontSize: 16 }}>🔐</span>
                        <p style={{
                            fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700,
                            color: 'rgba(226,232,240,0.35)', letterSpacing: '0.14em', textTransform: 'uppercase',
                        }}>
                            Admin Access
                        </p>
                    </button>
                </div>

                <p style={{
                    marginTop: 40, fontSize: 10, color: 'rgba(226,232,240,0.15)',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>
                    Loza Construction PLC · All Rights Reserved
                </p>
            </div>
        </div>
    )
}