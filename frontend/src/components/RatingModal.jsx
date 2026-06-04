import { useState } from 'react'

export default function RatingModal({ driver, onConfirm, onCancel }) {
    const [rating, setRating] = useState(driver.rating || 0)
    const [note, setNote] = useState(driver.ratingNote || '')

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
        }}>
            <div style={{
                background: 'rgba(4,20,40,0.99)', border: '1px solid rgba(245,166,35,0.3)',
                borderRadius: 14, padding: 24, width: '100%', maxWidth: 380,
                boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
            }}>
                <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: '#F5A623', letterSpacing: '0.06em', marginBottom: 4 }}>
                    RATE DRIVER
                </h3>
                <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.4)', marginBottom: 20 }}>{driver.name} · {driver.plate}</p>

                {/* Star rating */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} onClick={() => setRating(s)} style={{
                            fontSize: 32, background: 'none', border: 'none', cursor: 'pointer',
                            color: s <= rating ? '#F5A623' : 'rgba(226,232,240,0.2)',
                            transition: 'all 0.15s', transform: s <= rating ? 'scale(1.1)' : 'scale(1)',
                        }}>★</button>
                    ))}
                </div>
                <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(226,232,240,0.4)', marginBottom: 16 }}>
                    {rating === 0 ? 'Select a rating' : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                </p>

                <textarea
                    placeholder="Add a note (optional)..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={2}
                    style={{
                        width: '100%', background: 'rgba(2,11,24,0.9)',
                        border: '1px solid rgba(245,166,35,0.2)', color: '#fff',
                        fontFamily: "'Rajdhani',sans-serif", fontSize: 14,
                        padding: '10px 14px', borderRadius: 8, outline: 'none',
                        resize: 'none', boxSizing: 'border-box', marginBottom: 16,
                    }}
                />

                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={onCancel} style={{
                        flex: 1, padding: '11px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(226,232,240,0.5)', fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 16, letterSpacing: '0.06em', borderRadius: 8, cursor: 'pointer',
                    }}>CANCEL</button>
                    <button onClick={() => rating > 0 && onConfirm(rating, note)} disabled={rating === 0} style={{
                        flex: 1, padding: '11px',
                        background: rating > 0 ? 'linear-gradient(135deg,#F5A623,#FFD166)' : 'rgba(245,166,35,0.2)',
                        color: '#020B18', fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 16, letterSpacing: '0.06em', borderRadius: 8,
                        cursor: rating > 0 ? 'pointer' : 'not-allowed', border: 'none',
                    }}>SAVE RATING</button>
                </div>
            </div>
        </div>
    )
}