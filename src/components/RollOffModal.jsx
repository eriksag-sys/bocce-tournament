import { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { Btn } from './ui';

/**
 * Modal shown when two 3rd-place finishers are tied at the bracket cutoff.
 * Allows admin to enter the one-frame roll-off score.
 */
export default function RollOffModal({ player1, player2, name, onResult }) {
    const { colors } = useTheme();
    const { PANEL, GREEN, YELLOW, MUTED, BORDER, TEXT, INPUT_BG, INPUT_COLOR, OVERLAY } = colors;

    const [s1, setS1] = useState('');
    const [s2, setS2] = useState('');
    const n1 = parseInt(s1), n2 = parseInt(s2);
    const both = s1 !== '' && s2 !== '';
    const valid = both && !isNaN(n1) && !isNaN(n2) && n1 !== n2 && n1 >= 0 && n2 >= 0;

    const inp = {
        background: INPUT_BG, border: `1px solid ${BORDER}`, color: INPUT_COLOR,
        padding: '10px', borderRadius: 4, fontSize: 36, textAlign: 'center',
        outline: 'none', width: '100%', boxSizing: 'border-box'
    };

    const handleKey = e => {
        if (e.key === 'Enter' && valid) {
            onResult(n1 > n2 ? player1.id : player2.id);
        }
    };

    return (
        <div onKeyDown={handleKey} style={{
            position: 'fixed', inset: 0, background: OVERLAY,
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                background: PANEL, border: `2px solid ${YELLOW}`, borderRadius: 12,
                padding: 32, minWidth: 360, width: '92%', maxWidth: 500
            }}>
                <div style={{
                    fontSize: 22, fontWeight: 900, color: YELLOW, letterSpacing: 1,
                    marginBottom: 4, textAlign: 'center'
                }}>
                    ⚡ ROLL-OFF REQUIRED
                </div>
                <div style={{
                    color: MUTED, fontSize: 13, textAlign: 'center', marginBottom: 6
                }}>
                    These players are tied for the last bracket spot (Seed #16).
                </div>
                <div style={{
                    color: MUTED, fontSize: 12, textAlign: 'center', marginBottom: 20,
                    fontStyle: 'italic'
                }}>
                    One frame — whoever scores advances to the bracket.
                </div>

                {/* Player stats */}
                <div style={{
                    display: 'flex', gap: 12, marginBottom: 20, justifyContent: 'center'
                }}>
                    {[player1, player2].map(p => (
                        <div key={p.id} style={{
                            background: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: 6,
                            padding: '8px 14px', textAlign: 'center', flex: 1
                        }}>
                            <div style={{ fontWeight: 700, color: TEXT, fontSize: 16, marginBottom: 4 }}>
                                {name(p.id)}
                            </div>
                            <div style={{ fontSize: 11, color: MUTED }}>
                                {p.wins}W · {p.diff > 0 ? '+' : ''}{p.diff} diff
                            </div>
                        </div>
                    ))}
                </div>

                {/* Score inputs */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 20 }}>
                    {[
                        { p: player1, val: s1, set: setS1 },
                        { p: player2, val: s2, set: setS2 }
                    ].map(({ p, val, set }, i) => (
                        <div key={i} style={{ flex: 1 }}>
                            <div style={{
                                color: MUTED, fontSize: 12, marginBottom: 6, textTransform: 'uppercase',
                                letterSpacing: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                                {name(p.id)}
                            </div>
                            <input
                                autoFocus={i === 0} style={inp} type="number"
                                min={0} value={val}
                                onChange={e => set(e.target.value)} placeholder="0"
                            />
                        </div>
                    ))}
                </div>

                {both && !valid && (
                    <div style={{
                        color: YELLOW, fontSize: 13, marginBottom: 12,
                        padding: '8px 12px', background: YELLOW + '11', borderRadius: 4,
                        textAlign: 'center'
                    }}>
                        ⚠ Scores cannot be tied. One player must win.
                    </div>
                )}

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <Btn disabled={!valid} onClick={() => onResult(n1 > n2 ? player1.id : player2.id)}>
                        Confirm Winner
                    </Btn>
                </div>
                <div style={{ color: MUTED, fontSize: 11, marginTop: 12, textAlign: 'center' }}>
                    Press Enter to confirm
                </div>
            </div>
        </div>
    );
}
