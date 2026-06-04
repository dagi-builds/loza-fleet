import { useState } from 'react'

export default function DenyModal({ onConfirm, onCancel }) {
    const [note, setNote] = useState('')

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
        }}>
            <div style={{
                background: 'rgba(4,20,40,0.99)', border: '1px solid rgba(255,71,87,0.3)',
                borderRadius: 14, padding: 24, width: '100%', maxWidth: 380,
                boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
            }}>
                <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: '#FF4757', letterSpacing: '0.06em', marginBottom: 6 }}>
                    DENY REQUEST
                </h3>
                <p style={{ fontSize: 12, color: 'rgba(226,232,240,0.4)', marginBottom: 16 }}>
                    Add a note explaining why this request is denied (optional)
                </p>
                <textarea
                    placeholder="e.g. Budget limit reached, try next month..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={3}
                    style={{
                        width: '100%', background: 'rgba(2,11,24,0.9)',
                        border: '1px solid rgba(255,71,87,0.2)', color: '#fff',
                        fontFamily: "'Rajdhani',sans-serif", fontSize: 14,
                        padding: '12px 14px', borderRadius: 8, outline: 'none',
                        resize: 'vertical', boxSizing: 'border-box', marginBottom: 16,
                    }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={onCancel} style={{
                        flex: 1, padding: '11px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(226,232,240,0.5)', fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 16, letterSpacing: '0.06em', borderRadius: 8, cursor: 'pointer',
                    }}>CANCEL</button>
                    <button onClick={() => onConfirm(note)} style={{
                        flex: 1, padding: '11px',
                        background: 'rgba(255,71,87,0.15)', border: '1px solid rgba(255,71,87,0.4)',
                        color: '#FF4757', fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 16, letterSpacing: '0.06em', borderRadius: 8, cursor: 'pointer',
                    }}>✗ DENY</button>
                </div>
            </div>
        </div>
    )
}