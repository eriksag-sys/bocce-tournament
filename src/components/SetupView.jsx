import { useState, useEffect } from 'react';
import { COLORS } from '../logic/constants';
import { Btn } from './ui';

const { CARD, BORDER, GREEN, YELLOW, MUTED, LIGHT, BG } = COLORS;

export default function SetupView({ S, setS, startTournament, isAdmin }) {
    const [step, setStep] = useState(0);
    const [type, setType] = useState(null);
    const [count, setCount] = useState('24');
    const [names, setNames] = useState([]);
    const [tournamentName, setTournamentName] = useState('');

    useEffect(() => {
        if (step === 3) {
            const n = parseInt(count) || 24;
            setNames(Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: '' })));
        }
    }, [step, count]);

    const canStart = names.length > 0 && names.every(p => p.name.trim());
    const inp = {
        background: CARD, border: `1px solid ${BORDER}`, color: '#fff',
        padding: '10px 14px', borderRadius: 4, fontSize: 15, outline: 'none',
        boxSizing: 'border-box', width: '100%'
    };
    const center = { maxWidth: 520, margin: '60px auto', textAlign: 'center' };

    if (!isAdmin) {
        return (
            <div style={center}>
                <img src="/marin-bocce-logo.png" alt="Marin Bocce" style={{ height: 120, marginBottom: 16 }} />
                <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: 3 }}>
                    MARIN BOCCE
                </h1>
                <p style={{ color: GREEN, fontSize: 16, marginBottom: 24, letterSpacing: 2, fontWeight: 700 }}>
                    TOURNAMENT TRACKER
                </p>
                <div style={{
                    background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8,
                    padding: '24px 32px', display: 'inline-block'
                }}>
                    <p style={{ color: LIGHT, fontSize: 16, marginBottom: 8 }}>
                        ⏳ Waiting for admin to start the tournament...
                    </p>
                    <p style={{ color: MUTED, fontSize: 13 }}>
                        Scores and brackets will appear here once the tournament begins.
                    </p>
                </div>
            </div>
        );
    }

    // Step 0: Singles or Teams
    if (step === 0) return (
        <div style={center}>
            <img src="/marin-bocce-logo.png" alt="Marin Bocce" style={{ height: 120, marginBottom: 16 }} />
            <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: 3 }}>
                MARIN BOCCE
            </h1>
            <p style={{ color: GREEN, fontSize: 16, marginBottom: 48, letterSpacing: 2, fontWeight: 700 }}>
                TOURNAMENT TRACKER
            </p>
            <p style={{ color: LIGHT, marginBottom: 16, fontSize: 16, letterSpacing: 1 }}>SINGLES OR TEAMS?</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 32 }}>
                {['Singles', 'Teams'].map(t => (
                    <button key={t} onClick={() => { setType(t); setS(p => ({ ...p, isTeams: t === 'Teams' })); }} style={{
                        padding: '16px 40px', borderRadius: 6, fontWeight: 700, fontSize: 20, cursor: 'pointer',
                        background: type === t ? GREEN : CARD, color: type === t ? BG : LIGHT,
                        border: `2px solid ${type === t ? GREEN : BORDER}`, letterSpacing: 1, transition: 'all .2s',
                    }}>
                        {t}
                    </button>
                ))}
            </div>
            {type && <Btn onClick={() => setStep(1)}>Continue →</Btn>}
        </div>
    );

    // Step 1: Tournament Name
    if (step === 1) return (
        <div style={center}>
            <h2 style={{ color: '#fff', marginBottom: 8, fontSize: 30, letterSpacing: 2 }}>
                TOURNAMENT NAME
            </h2>
            <p style={{ color: MUTED, marginBottom: 24 }}>Give this tournament a name</p>
            <input
                style={{ ...inp, fontSize: 22, textAlign: 'center', maxWidth: 400, margin: '0 auto 24px', display: 'block' }}
                value={tournamentName}
                onChange={e => setTournamentName(e.target.value)}
                placeholder="e.g. Spring Classic 2026"
                autoFocus
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Btn variant="secondary" onClick={() => setStep(0)}>← Back</Btn>
                <Btn onClick={() => {
                    setS(p => ({ ...p, tournamentName: tournamentName.trim() || 'Unnamed Tournament' }));
                    setStep(2);
                }}>Continue →</Btn>
            </div>
        </div>
    );

    // Step 2: Player Count
    if (step === 2) return (
        <div style={center}>
            <h2 style={{ color: '#fff', marginBottom: 8, fontSize: 30, letterSpacing: 2 }}>
                HOW MANY {S.isTeams ? 'TEAMS' : 'PLAYERS'}?
            </h2>
            <p style={{ color: MUTED, marginBottom: 24 }}>Must be divisible by 4 for even pods</p>
            <input style={{ ...inp, fontSize: 32, textAlign: 'center', width: 160, margin: '0 auto 16px', display: 'block' }}
                type="number" value={count} onChange={e => setCount(e.target.value)} min={4} max={64} />
            {parseInt(count) % 4 !== 0 && (
                <p style={{ color: YELLOW, marginBottom: 16 }}>⚠ {count} is not divisible by 4</p>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Btn variant="secondary" onClick={() => setStep(1)}>← Back</Btn>
                <Btn onClick={() => setStep(3)} disabled={parseInt(count) % 4 !== 0}>Continue →</Btn>
            </div>
        </div>
    );

    // Step 3: Player Names
    return (
        <div style={{ maxWidth: 660, margin: '0 auto' }}>
            <h2 style={{ color: '#fff', marginBottom: 4, fontSize: 26, letterSpacing: 2 }}>
                ENTER {S.isTeams ? 'TEAM' : 'PLAYER'} NAMES
            </h2>
            <p style={{ color: MUTED, marginBottom: 4, fontSize: 14 }}>
                {S.tournamentName && <span style={{ color: GREEN, fontWeight: 700 }}>{S.tournamentName} — </span>}
                Will be randomly assigned to Pods A–F (4 per pod)
            </p>
            <p style={{ color: MUTED, marginBottom: 20, fontSize: 12 }}>
                {S.isTeams ? 'Teams' : 'Singles'} · {count} {S.isTeams ? 'teams' : 'players'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                {names.map((p, i) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: MUTED, fontSize: 12, minWidth: 26, textAlign: 'right' }}>{i + 1}.</span>
                        <input style={inp} placeholder={`${S.isTeams ? 'Team' : 'Player'} ${i + 1}`} value={p.name}
                            onChange={e => setNames(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
                <Btn variant="secondary" onClick={() => setStep(2)}>← Back</Btn>
                <Btn disabled={!canStart} onClick={() => startTournament(names.map(p => ({ ...p, name: p.name.trim() })))}>
                    🎯 Start Tournament
                </Btn>
                <Btn variant="secondary" onClick={() => setNames(prev => prev.map((p, i) => ({ ...p, name: `Player ${i + 1}` })))}>
                    Quick Fill
                </Btn>
            </div>
        </div>
    );
}
