import { useState } from 'react';
import { COLORS, POD_NAMES, POD_COLORS } from '../logic/constants';
import { Btn, Pill } from './ui';

const { CARD, BORDER, PANEL, GREEN, YELLOW, BLUE, RED, MUTED, LIGHT } = COLORS;

export default function HistoryView({ history, isAdmin, onDelete }) {
    const [expanded, setExpanded] = useState(null);

    if (!history || history.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                <p style={{ color: MUTED, fontSize: 18 }}>No tournament history yet.</p>
                <p style={{ color: MUTED, fontSize: 14, marginTop: 8 }}>
                    Completed tournaments will appear here.
                </p>
            </div>
        );
    }

    const getName = (tournament, pid) => {
        const p = tournament.players?.find(p => p.id === pid);
        return p ? p.name : 'TBD';
    };

    return (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 900, letterSpacing: 2, marginBottom: 16 }}>
                TOURNAMENT HISTORY
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[...history].reverse().map((t, ri) => {
                    const idx = history.length - 1 - ri; // actual index in array
                    const d = t.date ? new Date(t.date) : null;
                    const dateStr = d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

                    // Find champion
                    const finalG = t.bracketGames?.find(g => g.id === 'final');
                    const champion = finalG?.status === 'completed'
                        ? (finalG.score1 > finalG.score2 ? finalG.p1Id : finalG.p2Id)
                        : null;
                    const thirdG = t.bracketGames?.find(g => g.id === 'third');
                    const third = thirdG?.status === 'completed'
                        ? (thirdG.score1 > thirdG.score2 ? thirdG.p1Id : thirdG.p2Id)
                        : null;

                    const totalGames = (t.podGames?.length || 0) + (t.bracketGames?.length || 0);
                    const completedGames = (t.podGames?.filter(g => g.status === 'completed').length || 0) +
                        (t.bracketGames?.filter(g => g.status === 'completed').length || 0);

                    const isExpanded = expanded === idx;

                    return (
                        <div key={idx} style={{
                            background: CARD, border: `1px solid ${champion ? GREEN + '44' : BORDER}`,
                            borderRadius: 8, overflow: 'hidden'
                        }}>
                            {/* Summary row */}
                            <div
                                style={{
                                    padding: '14px 16px', cursor: 'pointer', display: 'flex',
                                    justifyContent: 'space-between', alignItems: 'center',
                                    transition: 'background .2s',
                                }}
                                onClick={() => setExpanded(isExpanded ? null : idx)}
                            >
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>
                                        {t.tournamentName || 'Unnamed Tournament'}
                                    </div>
                                    <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                                        {dateStr} · {t.players?.length || 0} {t.isTeams ? 'teams' : 'players'} · {completedGames}/{totalGames} games
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {champion && (
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase' }}>Champion</div>
                                            <div style={{ fontSize: 16, fontWeight: 900, color: YELLOW }}>
                                                🏆 {getName(t, champion)}
                                            </div>
                                        </div>
                                    )}
                                    <span style={{ color: MUTED, fontSize: 18 }}>{isExpanded ? '▾' : '▸'}</span>
                                </div>
                            </div>

                            {/* Expanded details */}
                            {isExpanded && (
                                <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${BORDER}` }}>
                                    {/* Top finishers */}
                                    {champion && (
                                        <div style={{ display: 'flex', gap: 12, marginTop: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                                            {[
                                                { label: '🥇 1st', pid: champion, color: YELLOW },
                                                { label: '🥈 2nd', pid: finalG?.status === 'completed' ? (finalG.score1 > finalG.score2 ? finalG.p2Id : finalG.p1Id) : null, color: '#c0c0c0' },
                                                { label: '🥉 3rd', pid: third, color: '#cd7f32' },
                                            ].filter(p => p.pid).map(({ label, pid, color }) => (
                                                <div key={label} style={{
                                                    background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 6,
                                                    padding: '8px 14px', display: 'flex', gap: 8, alignItems: 'center'
                                                }}>
                                                    <span style={{ fontSize: 12, color: MUTED }}>{label}</span>
                                                    <span style={{ fontWeight: 700, color }}>{getName(t, pid)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Bracket Seeds */}
                                    {t.bracketSeeds && t.bracketSeeds.length > 0 && (
                                        <div style={{ marginBottom: 12 }}>
                                            <div style={{ fontSize: 11, color: MUTED, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
                                                Bracket Seedings
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                {t.bracketSeeds.map(s => (
                                                    <span key={s.pid} style={{
                                                        background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 4,
                                                        padding: '3px 8px', fontSize: 12, display: 'inline-flex', gap: 6, alignItems: 'center'
                                                    }}>
                                                        <span style={{ color: s.seed <= 4 ? GREEN : s.seed <= 8 ? BLUE : MUTED, fontWeight: 800 }}>
                                                            #{s.seed}
                                                        </span>
                                                        <span style={{ color: LIGHT }}>{getName(t, s.pid)}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Delete button */}
                                    {isAdmin && (
                                        <div style={{ marginTop: 12, borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
                                            <Btn variant="red" style={{ fontSize: 12, padding: '6px 14px' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm(`Delete "${t.tournamentName || 'this tournament'}" from history?`)) {
                                                        onDelete(idx);
                                                        setExpanded(null);
                                                    }
                                                }}>
                                                🗑 Delete from History
                                            </Btn>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
