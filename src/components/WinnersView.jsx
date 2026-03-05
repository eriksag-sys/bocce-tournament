import { COLORS } from '../logic/constants';
import { calcStandings } from '../logic/standings';

const { CARD, BORDER, PANEL, GREEN, YELLOW, BLUE, RED, MUTED, LIGHT } = COLORS;

export default function WinnersView({ S, name }) {
    const { bracketGames, bracketSeeds, tournamentName } = S;
    if (!bracketGames || bracketGames.length === 0) return null;

    const finalG = bracketGames.find(g => g.id === 'final');
    const thirdG = bracketGames.find(g => g.id === 'third');

    const champion = finalG?.status === 'completed'
        ? (finalG.score1 > finalG.score2 ? finalG.p1Id : finalG.p2Id) : null;
    const runnerUp = finalG?.status === 'completed'
        ? (finalG.score1 > finalG.score2 ? finalG.p2Id : finalG.p1Id) : null;
    const third = thirdG?.status === 'completed'
        ? (thirdG.score1 > thirdG.score2 ? thirdG.p1Id : thirdG.p2Id) : null;
    const fourth = thirdG?.status === 'completed'
        ? (thirdG.score1 > thirdG.score2 ? thirdG.p2Id : thirdG.p1Id) : null;

    const podiums = [
        { place: '🥇 Champion', pid: champion, color: YELLOW, bg: '#1a1200', borderColor: YELLOW },
        { place: '🥈 Runner-Up', pid: runnerUp, color: '#c0c0c0', bg: '#14141a', borderColor: '#666' },
        { place: '🥉 3rd Place', pid: third, color: '#cd7f32', bg: '#1a1408', borderColor: '#8b5e3c' },
        { place: '4th Place', pid: fourth, color: MUTED, bg: CARD, borderColor: BORDER },
    ];

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            {/* Trophy header */}
            <div style={{ marginBottom: 32 }}>
                <img src="/marin-bocce-logo.png" alt="Marin Bocce" style={{ height: 80, marginBottom: 12 }} />
                <div style={{ fontSize: 14, color: GREEN, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
                    {tournamentName || 'Tournament'}
                </div>
                <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: 3, marginBottom: 4 }}>
                    FINAL RESULTS
                </h1>
                <div style={{ color: MUTED, fontSize: 13 }}>
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
            </div>

            {/* Podium cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {podiums.filter(p => p.pid).map(({ place, pid, color, bg, borderColor }, i) => (
                    <div key={i} style={{
                        background: bg, border: `2px solid ${borderColor}`,
                        borderRadius: 12, padding: i === 0 ? '24px 20px' : '16px 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: i === 0 ? 14 : 12, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                                {place}
                            </div>
                            <div style={{ fontSize: i === 0 ? 32 : 22, fontWeight: 900, color, letterSpacing: 2 }}>
                                {name(pid).toUpperCase()}
                            </div>
                        </div>
                        {/* Seed info */}
                        {bracketSeeds && (() => {
                            const seed = bracketSeeds.find(s => s.pid === pid);
                            return seed ? (
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 12, color: MUTED }}>Seed</div>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: MUTED }}>#{seed.seed}</div>
                                </div>
                            ) : null;
                        })()}
                    </div>
                ))}
            </div>

            {/* Championship score */}
            {finalG?.status === 'completed' && (
                <div style={{
                    background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8,
                    padding: '16px 20px', marginBottom: 16
                }}>
                    <div style={{ fontSize: 12, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                        Championship Game
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontSize: 20 }}>
                        <span style={{ fontWeight: finalG.score1 > finalG.score2 ? 900 : 400, color: finalG.score1 > finalG.score2 ? GREEN : LIGHT }}>
                            {name(finalG.p1Id)}
                        </span>
                        <span style={{ fontWeight: 900, color: finalG.score1 > finalG.score2 ? GREEN : RED }}>{finalG.score1}</span>
                        <span style={{ color: MUTED }}>vs</span>
                        <span style={{ fontWeight: 900, color: finalG.score2 > finalG.score1 ? GREEN : RED }}>{finalG.score2}</span>
                        <span style={{ fontWeight: finalG.score2 > finalG.score1 ? 900 : 400, color: finalG.score2 > finalG.score1 ? GREEN : LIGHT }}>
                            {name(finalG.p2Id)}
                        </span>
                    </div>
                </div>
            )}

            {/* 3rd place score */}
            {thirdG?.status === 'completed' && (
                <div style={{
                    background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8,
                    padding: '12px 20px'
                }}>
                    <div style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                        3rd Place Game
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 16 }}>
                        <span style={{ fontWeight: thirdG.score1 > thirdG.score2 ? 700 : 400, color: thirdG.score1 > thirdG.score2 ? GREEN : LIGHT }}>
                            {name(thirdG.p1Id)}
                        </span>
                        <span style={{ fontWeight: 800, color: thirdG.score1 > thirdG.score2 ? GREEN : RED }}>{thirdG.score1}</span>
                        <span style={{ color: MUTED }}>vs</span>
                        <span style={{ fontWeight: 800, color: thirdG.score2 > thirdG.score1 ? GREEN : RED }}>{thirdG.score2}</span>
                        <span style={{ fontWeight: thirdG.score2 > thirdG.score1 ? 700 : 400, color: thirdG.score2 > thirdG.score1 ? GREEN : LIGHT }}>
                            {name(thirdG.p2Id)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
