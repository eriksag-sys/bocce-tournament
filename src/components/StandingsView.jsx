import { useTheme } from '../ThemeContext';
import { POD_NAMES } from '../logic/constants';
import { Btn } from './ui';

export default function StandingsView({ st, name, phase, podGames, advanceToBracket, isAdmin }) {
    const { colors, podColors } = useTheme();
    const { CARD, BORDER, PANEL, GREEN, BLUE, YELLOW, RED, MUTED, LIGHT, TEXT, DONE_BG } = colors;

    const allDone = podGames.every(g => g.status === 'completed');

    return (
        <div>
            {allDone && phase === 'pods' && (
                <div style={{
                    background: DONE_BG, border: `1px solid ${GREEN}`, borderRadius: 8,
                    padding: '16px 20px', marginBottom: 24, display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap'
                }}>
                    <div>
                        <div style={{ color: GREEN, fontWeight: 700, fontSize: 18 }}>✅ All Pod Games Complete!</div>
                        <div style={{ color: MUTED, fontSize: 14 }}>
                            {isAdmin
                                ? 'Ready to seed and generate the afternoon bracket'
                                : 'Waiting for admin to generate the bracket'}
                        </div>
                    </div>
                    {isAdmin && (
                        <Btn style={{ fontSize: 16, padding: '12px 28px' }} onClick={advanceToBracket}>
                            Generate Bracket →
                        </Btn>
                    )}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                {POD_NAMES.map(pod => {
                    const standings = st[pod] || [];
                    return (
                        <div key={pod} style={{
                            background: CARD, border: `1px solid ${BORDER}`,
                            borderRadius: 8, overflow: 'hidden'
                        }}>
                            <div style={{
                                background: PANEL, padding: '10px 16px',
                                borderBottom: `1px solid ${BORDER}`,
                                display: 'flex', alignItems: 'center', gap: 10
                            }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: podColors[pod] }} />
                                <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: 2, color: TEXT }}>POD {pod}</span>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        {['#', 'Name', 'W', '+/-', 'PF', 'PA'].map(h => (
                                            <th key={h} style={{
                                                padding: '7px 12px',
                                                textAlign: h === 'Name' || h === '#' ? 'left' : 'center',
                                                fontWeight: 700
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {standings.map((p, i) => {
                                        const rowCol = [GREEN, BLUE, YELLOW, MUTED][i] || MUTED;
                                        return (
                                            <tr key={p.id} style={{ borderTop: `1px solid ${BORDER}` }}>
                                                <td style={{ padding: '10px 12px', color: rowCol, fontWeight: 800, fontSize: 16 }}>{i + 1}</td>
                                                <td style={{ padding: '10px 12px', fontWeight: 600, color: TEXT, fontSize: 14 }}>{name(p.id)}</td>
                                                <td style={{ padding: '10px 12px', textAlign: 'center', color: GREEN, fontWeight: 700 }}>{p.wins}</td>
                                                <td style={{
                                                    padding: '10px 12px', textAlign: 'center', fontWeight: 800,
                                                    color: p.diff > 0 ? GREEN : p.diff < 0 ? RED : MUTED
                                                }}>{p.diff > 0 ? '+' : ''}{p.diff}</td>
                                                <td style={{ padding: '10px 12px', textAlign: 'center', color: LIGHT }}>{p.pFor}</td>
                                                <td style={{ padding: '10px 12px', textAlign: 'center', color: MUTED }}>{p.pAgainst}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
