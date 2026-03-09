import { useTheme } from '../ThemeContext';
import { Pill } from './ui';

function BracketSlot({ game, style, name, seedFor, onClick, isChamp, isAdmin }) {
    const { colors } = useTheme();
    const { CARD, BORDER, GREEN, YELLOW, BLUE, RED, MUTED, LIGHT, CHAMP_BG, DONE_BG, ACTIVE_BG, WIN_BG } = colors;

    const { status, p1Id, p2Id, score1, score2, courtId, label } = game;
    const active = status === 'active';
    const done = status === 'completed';
    const w1 = done && score1 > score2;
    const w2 = done && score2 > score1;
    const sd1 = seedFor(p1Id);
    const sd2 = seedFor(p2Id);

    const clickable = (active || done) && isAdmin;

    return (
        <div style={{
            ...style,
            background: isChamp ? CHAMP_BG : done ? DONE_BG : active ? ACTIVE_BG : CARD,
            border: `1px solid ${isChamp ? YELLOW : done ? GREEN + '66' : active ? BLUE : BORDER}`,
            borderRadius: 6, overflow: 'hidden', cursor: clickable ? 'pointer' : 'default',
            boxShadow: active ? `0 0 18px ${BLUE}33` : 'none', transition: 'box-shadow .2s',
        }} onClick={clickable ? onClick : undefined}>
            <div style={{
                background: 'rgba(0,0,0,.15)', padding: '3px 8px', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center', fontSize: 10
            }}>
                <span style={{
                    color: isChamp ? YELLOW : MUTED, fontWeight: 700, letterSpacing: 0.8,
                    textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', maxWidth: 130
                }}>
                    {label || `Court ${courtId}`}
                </span>
                {active && isAdmin && (
                    <span style={{ color: BLUE, fontWeight: 700, letterSpacing: 0.5, flexShrink: 0 }}>TAP</span>
                )}
                {done && isAdmin && (
                    <span style={{ color: MUTED, fontWeight: 700, letterSpacing: 0.5, flexShrink: 0, fontSize: 9 }}>✏️ EDIT</span>
                )}
            </div>
            {[
                { pid: p1Id, sc: score1, win: w1, seed: sd1 },
                { pid: p2Id, sc: score2, win: w2, seed: sd2 }
            ].map(({ pid, sc, win, seed }, i) => (
                <div key={i} style={{
                    padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 4,
                    borderTop: i > 0 ? `1px solid ${BORDER}` : 'none',
                    background: win ? WIN_BG : 'transparent'
                }}>
                    {seed && (
                        <span style={{ fontSize: 10, color: MUTED, minWidth: 18, textAlign: 'right', flexShrink: 0 }}>
                            #{seed.seed}
                        </span>
                    )}
                    <span style={{
                        flex: 1, fontWeight: win ? 700 : 400,
                        color: win ? GREEN : pid ? LIGHT : MUTED,
                        fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                        {pid ? name(pid) : 'TBD'}
                    </span>
                    {sc != null && (
                        <span style={{
                            fontWeight: 900, fontSize: 16,
                            color: win ? GREEN : RED, marginLeft: 4, flexShrink: 0
                        }}>
                            {sc}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function BracketView({ S, name, setS, isAdmin }) {
    const { colors } = useTheme();
    const { CARD, BORDER, GREEN, YELLOW, BLUE, RED, MUTED, LIGHT, TEXT, CHAMP_BG } = colors;

    if (S.phase === 'pods') return (
        <div style={{ padding: 60, textAlign: 'center', color: MUTED }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
            <p style={{ fontSize: 20 }}>Bracket will appear once all pod games are complete.</p>
            <p style={{ marginTop: 8 }}>
                Go to <strong style={{ color: LIGHT }}>Standings</strong> to advance when ready.
            </p>
        </div>
    );

    const { bracketGames, bracketSeeds } = S;
    const r1 = bracketGames.filter(g => g.round === 1);
    const qf = bracketGames.filter(g => g.round === 2);
    const sf = bracketGames.filter(g => g.round === 3);
    const finalG = bracketGames.find(g => g.id === 'final');
    const thirdG = bracketGames.find(g => g.id === 'third');
    const champion = finalG?.status === 'completed'
        ? (finalG.score1 > finalG.score2 ? finalG.p1Id : finalG.p2Id) : null;

    const seedFor = pid => pid ? bracketSeeds.find(s => s.pid === pid) : null;
    const openScore = g => {
        if ((g?.status === 'active' || g?.status === 'completed') && isAdmin) {
            setS(p => ({ ...p, scoreModal: g.id }));
        }
    };

    const SLOT_H = 90, GAME_H = 74, GAME_W = 200, GAP_W = 48;
    const totalH = 8 * SLOT_H + 80;
    const getTop = (round, slot) => {
        if (round === 1) return slot * SLOT_H + (SLOT_H - GAME_H) / 2;
        if (round === 2) return slot * 2 * SLOT_H + SLOT_H - GAME_H / 2;
        if (round === 3) return slot * 4 * SLOT_H + 2 * SLOT_H - GAME_H / 2;
        if (round === 4 && slot === 0) return 4 * SLOT_H - GAME_H / 2;
        if (round === 4 && slot === 1) return 7 * SLOT_H;
        return 0;
    };
    const getLeft = round => (round - 1) * (GAME_W + GAP_W);
    const totalW = 4 * (GAME_W + GAP_W) + GAME_W;

    const connLine = (fr, fs, tr, ts) => {
        const x1 = getLeft(fr) + GAME_W, y1 = getTop(fr, fs) + GAME_H / 2;
        const x2 = getLeft(tr), y2 = getTop(tr, ts) + GAME_H / 2;
        const mx = (x1 + x2) / 2;
        return `M ${x1} ${y1} H ${mx} V ${y2} H ${x2}`;
    };

    return (
        <div>
            {champion && (
                <div style={{
                    textAlign: 'center', marginBottom: 20, padding: '14px',
                    background: CHAMP_BG, border: `2px solid ${YELLOW}`, borderRadius: 8
                }}>
                    <span style={{ fontSize: 28, fontWeight: 900, color: YELLOW, letterSpacing: 3 }}>
                        🏆 CHAMPION: {name(champion).toUpperCase()}
                    </span>
                </div>
            )}

            <div style={{ overflowX: 'auto', paddingBottom: 12 }}>
                <div style={{ position: 'relative', height: totalH + 32, width: totalW, minWidth: totalW }}>
                    {['Round of 16', 'Quarter Finals', 'Semi Finals', 'Finals'].map((label, i) => (
                        <div key={i} style={{
                            position: 'absolute', top: 0, left: getLeft(i + 1), width: GAME_W,
                            fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase',
                            letterSpacing: 0.8, textAlign: 'center', paddingBottom: 6
                        }}>
                            {label}
                        </div>
                    ))}

                    <svg style={{ position: 'absolute', top: 18, left: 0, width: totalW, height: totalH, pointerEvents: 'none' }}>
                        {r1.map((g, i) => (
                            <path key={g.id} d={connLine(1, i, 2, Math.floor(i / 2))} fill="none" stroke={BORDER} strokeWidth={1.5} />
                        ))}
                        {qf.map((g, i) => (
                            <path key={g.id} d={connLine(2, i, 3, Math.floor(i / 2))} fill="none" stroke={BORDER} strokeWidth={1.5} />
                        ))}
                        {sf.map((g, i) => (
                            <path key={'sf_champ_' + g.id} d={connLine(3, i, 4, 0)} fill="none" stroke={BORDER} strokeWidth={1.5} />
                        ))}
                        {sf.map((g, i) => (
                            <path key={'sf_third_' + g.id} d={connLine(3, i, 4, 1)} fill="none" stroke={BORDER} strokeWidth={1} strokeDasharray="4,3" opacity={0.4} />
                        ))}
                    </svg>

                    {r1.map((g, i) => (
                        <BracketSlot key={g.id} game={g} name={name} seedFor={seedFor} isAdmin={isAdmin}
                            style={{ position: 'absolute', left: getLeft(1), top: getTop(1, i) + 18, width: GAME_W, height: GAME_H }}
                            onClick={() => openScore(g)} />
                    ))}
                    {qf.map((g, i) => (
                        <BracketSlot key={g.id} game={g} name={name} seedFor={seedFor} isAdmin={isAdmin}
                            style={{ position: 'absolute', left: getLeft(2), top: getTop(2, i) + 18, width: GAME_W, height: GAME_H }}
                            onClick={() => openScore(g)} />
                    ))}
                    {sf.map((g, i) => (
                        <BracketSlot key={g.id} game={g} name={name} seedFor={seedFor} isAdmin={isAdmin}
                            style={{ position: 'absolute', left: getLeft(3), top: getTop(3, i) + 18, width: GAME_W, height: GAME_H }}
                            onClick={() => openScore(g)} />
                    ))}
                    {finalG && (
                        <BracketSlot game={finalG} name={name} seedFor={seedFor} isAdmin={isAdmin}
                            style={{ position: 'absolute', left: getLeft(4), top: getTop(4, 0) + 18, width: GAME_W, height: GAME_H }}
                            onClick={() => openScore(finalG)} isChamp />
                    )}
                    {thirdG && (
                        <BracketSlot game={thirdG} name={name} seedFor={seedFor} isAdmin={isAdmin}
                            style={{ position: 'absolute', left: getLeft(4), top: getTop(4, 1) + 18, width: GAME_W, height: GAME_H }}
                            onClick={() => openScore(thirdG)} />
                    )}
                </div>
            </div>

            <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
                <div style={{
                    fontSize: 12, color: MUTED, letterSpacing: 2, textTransform: 'uppercase',
                    marginBottom: 12, fontWeight: 700
                }}>
                    Bracket Seedings &amp; Point Differentials
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {bracketSeeds.map(s => (
                        <div key={s.pid} style={{
                            background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6,
                            padding: '6px 12px', fontSize: 14, display: 'flex', gap: 10, alignItems: 'center'
                        }}>
                            <span style={{
                                color: s.seed <= 4 ? GREEN : s.seed <= 8 ? BLUE : s.seed <= 12 ? YELLOW : MUTED,
                                fontWeight: 800, minWidth: 28
                            }}>#{s.seed}</span>
                            <span style={{ color: TEXT, fontWeight: 600 }}>{name(s.pid)}</span>
                            <span style={{
                                color: s.diff > 0 ? GREEN : s.diff < 0 ? RED : MUTED, fontSize: 12
                            }}>{s.diff > 0 ? '+' : ''}{s.diff}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
