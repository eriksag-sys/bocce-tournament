import { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { Btn, Pill, PlayerRow, SectionHeader, StatBox } from './ui';

function GameCard({ game, name, onScore, onEdit, isAdmin }) {
    const { colors, podColors } = useTheme();
    const { CARD, BORDER, BLUE, YELLOW, GREEN, MUTED, DONE_BG, DONE_BORDER, ACTIVE_BG } = colors;

    const { status, courtId, podId, round, p1Id, p2Id, score1, score2 } = game;
    const done = status === 'completed';
    const active = status === 'active';
    const waiting = status === 'queued';
    const w1 = done && score1 > score2;
    const w2 = done && score2 > score1;

    return (
        <div style={{
            background: done ? DONE_BG : active ? ACTIVE_BG : CARD,
            border: `1px solid ${done ? DONE_BORDER : active ? BLUE : BORDER}`,
            borderRadius: 8, padding: '12px 14px',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Pill color={podColors[podId] || GREEN} text={`Pod ${podId}`} />
                    <span style={{ color: MUTED, fontSize: 12 }}>Rnd {round}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {courtId && <Pill color={active ? BLUE : done ? GREEN : MUTED} text={`Court ${courtId}`} />}
                    {active && isAdmin && onScore && (
                        <Btn style={{ padding: '3px 10px', fontSize: 11 }} onClick={onScore}>Enter Score</Btn>
                    )}
                    {done && isAdmin && onEdit && (
                        <Btn style={{ padding: '3px 10px', fontSize: 11, background: 'transparent', border: `1px solid ${MUTED}`, color: MUTED }}
                            onClick={onEdit}>✏️ Edit</Btn>
                    )}
                    {waiting && <span style={{ color: YELLOW, fontSize: 12 }}>Waiting…</span>}
                </div>
            </div>
            <div>
                <PlayerRow name={name(p1Id)} score={done ? score1 : null} win={w1} />
                <PlayerRow name={name(p2Id)} score={done ? score2 : null} win={w2} />
            </div>
        </div>
    );
}

export default function GamesView({ S, name, setS, isAdmin }) {
    const { colors } = useTheme();
    const { BLUE, YELLOW, GREEN, MUTED, BORDER } = colors;

    const [showAll, setShowAll] = useState(false);
    const active = S.podGames.filter(g => g.status === 'active');
    const queued = S.podGames.filter(g => g.status === 'queued');
    const completed = S.podGames.filter(g => g.status === 'completed');

    const displayedCompleted = showAll ? [...completed].reverse() : [...completed].reverse().slice(0, 6);

    return (
        <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                <StatBox label="Active" val={active.length} col={BLUE} />
                <StatBox label="Waiting" val={queued.length} col={YELLOW} />
                <StatBox label="Done" val={completed.length} col={GREEN} />
                <StatBox label="Total" val={S.podGames.length} col={MUTED} />
            </div>

            {active.length > 0 && <>
                <SectionHeader color={BLUE}>🟢 Active Games — Courts In Use</SectionHeader>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10, marginBottom: 24 }}>
                    {active.map(g => (
                        <GameCard key={g.id} game={g} name={name} isAdmin={isAdmin}
                            onScore={() => setS(p => ({ ...p, scoreModal: g.id }))} />
                    ))}
                </div>
            </>}

            {queued.length > 0 && <>
                <SectionHeader color={YELLOW}>⏳ Waiting for Court ({queued.length} game{queued.length !== 1 ? 's' : ''})</SectionHeader>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10, marginBottom: 24 }}>
                    {queued.map(g => <GameCard key={g.id} game={g} name={name} isAdmin={isAdmin} />)}
                </div>
            </>}

            {completed.length > 0 && <>
                <SectionHeader color={MUTED}>✓ Completed ({completed.length})</SectionHeader>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 8 }}>
                    {displayedCompleted.map(g => (
                        <GameCard key={g.id} game={g} name={name} isAdmin={isAdmin}
                            onEdit={() => setS(p => ({ ...p, scoreModal: g.id }))} />
                    ))}
                </div>
                {completed.length > 6 && (
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <Btn
                            style={{
                                padding: '8px 24px', fontSize: 13,
                                background: 'transparent', border: `1px solid ${BORDER}`,
                                color: MUTED
                            }}
                            onClick={() => setShowAll(!showAll)}
                        >
                            {showAll ? 'Show Less' : `Show All (${completed.length})`}
                        </Btn>
                    </div>
                )}
            </>}
        </div>
    );
}
