import { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { Btn, Pill } from './ui';

export default function ScoreModal({ game, name, onSubmit, onClose }) {
    const { colors } = useTheme();
    const { CARD, BORDER, PANEL, GREEN, YELLOW, BLUE, MUTED, TEXT, INPUT_BG, INPUT_COLOR, OVERLAY } = colors;

    const isEdit = game.status === 'completed';
    const [s1, setS1] = useState(isEdit ? String(game.score1) : '');
    const [s2, setS2] = useState(isEdit ? String(game.score2) : '');
    const n1 = parseInt(s1), n2 = parseInt(s2);
    const both = s1 !== '' && s2 !== '';
    const valid = both && !isNaN(n1) && !isNaN(n2) && n1 !== n2 && n1 >= 0 && n2 >= 0 && n1 <= 12 && n2 <= 12 && (n1 === 12 || n2 === 12);

    const inp = {
        background: INPUT_BG, border: `1px solid ${BORDER}`, color: INPUT_COLOR,
        padding: '10px', borderRadius: 4, fontSize: 36, textAlign: 'center',
        outline: 'none', width: '100%', boxSizing: 'border-box'
    };

    const handleKey = e => {
        if (e.key === 'Enter' && valid) onSubmit(n1, n2);
        if (e.key === 'Escape') onClose();
    };

    return (
        <div onKeyDown={handleKey} style={{
            position: 'fixed', inset: 0, background: OVERLAY,
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{
                background: PANEL, border: `2px solid ${GREEN}`, borderRadius: 12,
                padding: 32, minWidth: 360, width: '92%', maxWidth: 460
            }}>
                <div style={{ marginBottom: 4, fontSize: 22, fontWeight: 900, color: TEXT, letterSpacing: 1 }}>
                    ENTER SCORE
                </div>
                {game.courtId && (
                    <div style={{ marginBottom: 16 }}>
                        <Pill color={BLUE} text={`Court ${game.courtId}`} />
                    </div>
                )}
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 20 }}>
                    {[
                        { id: game.p1Id, val: s1, set: setS1 },
                        { id: game.p2Id, val: s2, set: setS2 }
                    ].map(({ id, val, set }, i) => (
                        <div key={i} style={{ flex: 1 }}>
                            <div style={{
                                color: MUTED, fontSize: 12, marginBottom: 6, textTransform: 'uppercase',
                                letterSpacing: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                                {name(id)}
                            </div>
                            <input
                                autoFocus={i === 0} style={inp} type="number"
                                min={0} max={12} value={val}
                                onChange={e => set(e.target.value)} placeholder="0"
                            />
                        </div>
                    ))}
                </div>
                {both && !valid && (
                    <div style={{
                        color: YELLOW, fontSize: 13, marginBottom: 12,
                        padding: '8px 12px', background: YELLOW + '11', borderRadius: 4
                    }}>
                        ⚠ One score must be 12, none above 12. No ties.
                    </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                    <Btn disabled={!valid} onClick={() => onSubmit(n1, n2)}>Save Score</Btn>
                    <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
                </div>
                <div style={{ color: MUTED, fontSize: 11, marginTop: 12 }}>
                    Press Enter to save · Escape to cancel
                </div>
            </div>
        </div>
    );
}
