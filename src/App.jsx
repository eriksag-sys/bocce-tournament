import { useCallback } from 'react';
import { useTheme } from './ThemeContext';
import { BLANK_STATE, BLANK_TOURNAMENT, POD_NAMES, COURT_ORDER, RR, shuffle } from './logic/constants';
import { assignCourts, updateCourtHistory } from './logic/courts';
import { calcStandings } from './logic/standings';
import { generateBracket, advanceBracketGame, rescoreBracketGame, checkForRollOff } from './logic/bracket';
import { useAuth } from './hooks/useAuth';
import { useTournament } from './hooks/useTournament';
import Header from './components/Header';
import SetupView from './components/SetupView';
import GamesView from './components/GamesView';
import StandingsView from './components/StandingsView';
import BracketView from './components/BracketView';
import ScoreModal from './components/ScoreModal';
import WinnersView from './components/WinnersView';
import HistoryView from './components/HistoryView';
import RollOffModal from './components/RollOffModal';

export default function App() {
    const { colors } = useTheme();
    const { user, loading, isAdmin } = useAuth();
    const [S, setS, resetState, archiveTournament, deleteHistoryItem] = useTournament(isAdmin);

    const name = useCallback(
        id => (S.players.find(p => p.id === id) || { name: 'TBD' }).name,
        [S.players]
    );

    const st = S.phase !== 'setup' ? calcStandings(S.podGames, S.pods) : {};

    const isFinished = S.phase === 'bracket' && S.bracketGames?.length > 0 &&
        S.bracketGames.find(g => g.id === 'final')?.status === 'completed' &&
        S.bracketGames.find(g => g.id === 'third')?.status === 'completed';

    const effectiveTab = isFinished && S.tab === 'bracket' ? 'winners' : S.tab;

    // ── Start Tournament ──────────────────────────────────────────────────────
    const startTournament = useCallback((players) => {
        const ids = shuffle(players.map(p => p.id));
        const pods = Object.fromEntries(POD_NAMES.map((p, i) => [p, ids.slice(i * 4, i * 4 + 4)]));
        const podGames = [];

        POD_NAMES.forEach(pod => {
            const pp = pods[pod];
            RR.forEach((rnd, ri) => rnd.forEach(([a, b], gi) =>
                podGames.push({
                    id: `${pod}_r${ri + 1}_${gi}`, podId: pod, round: ri + 1,
                    p1Id: pp[a], p2Id: pp[b], score1: null, score2: null,
                    status: 'pending', courtId: null
                })
            ));
        });

        const queue = podGames.filter(g => g.round === 1).map(g => g.id);
        const courts = Object.fromEntries(COURT_ORDER.map(c => [c, { gameId: null }]));
        const result = assignCourts(podGames, courts, queue, {});

        setS(prev => ({
            ...BLANK_TOURNAMENT,
            history: prev.history || [],
            phase: 'pods', isTeams: prev.isTeams, tournamentName: prev.tournamentName,
            players, pods,
            podGames: result.games, courts: result.courts, queue: result.queue,
            courtHistory: result.courtHistory, tab: 'games'
        }));
    }, [setS]);

    // ── Submit Pod Score ──────────────────────────────────────────────────────
    const submitPodScore = useCallback((gameId, s1, s2) => {
        setS(prev => {
            const done = prev.podGames.find(g => g.id === gameId);
            if (!done) return prev;

            const wasCompleted = done.status === 'completed';

            let games = prev.podGames.map(g =>
                g.id === gameId ? { ...g, score1: s1, score2: s2, status: 'completed' } : g
            );

            if (wasCompleted) {
                if (prev.phase === 'bracket') {
                    const oldSt = calcStandings(prev.podGames, prev.pods);
                    const newSt = calcStandings(games, prev.pods);

                    let seedingChanged = false;
                    POD_NAMES.forEach(pod => {
                        const oldOrder = (oldSt[pod] || []).map(p => p.id).join(',');
                        const newOrder = (newSt[pod] || []).map(p => p.id).join(',');
                        if (oldOrder !== newOrder) seedingChanged = true;
                    });

                    return {
                        ...prev,
                        podGames: games,
                        scoreModal: null,
                        showRegenPrompt: seedingChanged,
                    };
                }

                return {
                    ...prev,
                    podGames: games,
                    scoreModal: null,
                };
            }

            let courts = Object.fromEntries(
                Object.entries(prev.courts).map(([k, v]) => [k, { ...v }])
            );
            if (done.courtId) courts[done.courtId] = { gameId: null };

            let courtHistory = updateCourtHistory(prev.courtHistory || {}, done);

            let queue = [...prev.queue];

            POD_NAMES.forEach(pod => {
                for (let r = 2; r <= 3; r++) {
                    const prevR = games.filter(g => g.podId === pod && g.round === r - 1);
                    if (!prevR.every(g => g.status === 'completed')) continue;
                    games.filter(g => g.podId === pod && g.round === r && g.status === 'pending')
                        .forEach(g => { if (!queue.includes(g.id)) queue.push(g.id); });
                }
            });

            const result = assignCourts(games, courts, queue, courtHistory);
            const allDone = result.games.every(g => g.status === 'completed');

            return {
                ...prev,
                podGames: result.games, courts: result.courts, queue: result.queue,
                courtHistory: result.courtHistory,
                scoreModal: null, tab: allDone ? 'standings' : prev.tab
            };
        });
    }, [setS]);

    // ── Regenerate Bracket ───────────────────────────────────────────────────
    const regenBracket = useCallback(() => {
        const newSt = calcStandings(S.podGames, S.pods);
        const { bracketSeeds, bracketGames } = generateBracket(newSt);
        setS(prev => ({
            ...prev,
            bracketSeeds, bracketGames,
            showRegenPrompt: false,
            tab: 'bracket'
        }));
    }, [S.podGames, S.pods, setS]);

    const dismissRegen = useCallback(() => {
        setS(prev => ({ ...prev, showRegenPrompt: false }));
    }, [setS]);

    // ── Advance to Bracket (with roll-off check) ──────────────────────────────
    const advanceToBracket = useCallback(() => {
        const rollOff = checkForRollOff(st);
        if (rollOff) {
            // Tie at the bracket cutoff — show roll-off modal
            setS(prev => ({
                ...prev,
                rollOff: { player1: rollOff.player1, player2: rollOff.player2 }
            }));
        } else {
            const { bracketSeeds, bracketGames } = generateBracket(st);
            setS(prev => ({
                ...prev, phase: 'bracket', bracketSeeds, bracketGames, tab: 'bracket'
            }));
        }
    }, [st, setS]);

    // ── Handle Roll-Off Result ────────────────────────────────────────────────
    const handleRollOffResult = useCallback((winnerId) => {
        const { bracketSeeds, bracketGames } = generateBracket(st, winnerId);
        setS(prev => ({
            ...prev,
            phase: 'bracket', bracketSeeds, bracketGames,
            rollOff: null, tab: 'bracket'
        }));
    }, [st, setS]);

    // ── Submit Bracket Score ──────────────────────────────────────────────────
    const submitBracketScore = useCallback((gameId, s1, s2) => {
        setS(prev => {
            const existingGame = prev.bracketGames.find(g => g.id === gameId);
            if (!existingGame) return prev;

            let newBracket;
            if (existingGame.status === 'completed') {
                newBracket = rescoreBracketGame(prev.bracketGames, gameId, s1, s2);
            } else {
                newBracket = advanceBracketGame(prev.bracketGames, gameId, s1, s2);
            }

            const finalG = newBracket.find(g => g.id === 'final');
            const thirdG = newBracket.find(g => g.id === 'third');
            const justFinished = finalG?.status === 'completed' && thirdG?.status === 'completed';

            return {
                ...prev,
                bracketGames: newBracket,
                scoreModal: null,
                tab: justFinished ? 'winners' : prev.tab
            };
        });
    }, [setS]);

    // ── Score Modal Handler ───────────────────────────────────────────────────
    const handleModalSubmit = useCallback((s1, s2) => {
        if (!S.scoreModal) return;
        const isPodGame = S.podGames.some(g => g.id === S.scoreModal);
        if (isPodGame) submitPodScore(S.scoreModal, s1, s2);
        else submitBracketScore(S.scoreModal, s1, s2);
    }, [S.scoreModal, S.podGames, submitPodScore, submitBracketScore]);

    const modalGame = S.scoreModal
        ? (S.podGames.find(g => g.id === S.scoreModal) || S.bracketGames?.find(g => g.id === S.scoreModal))
        : null;

    if (loading) {
        return (
            <div style={{
                fontFamily: "'Barlow Condensed', system-ui, sans-serif",
                background: colors.BG, color: colors.LIGHT, minHeight: '100vh',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <img src="/marin-bocce-logo.png" alt="Marin Bocce" style={{ height: 80, marginBottom: 12 }} />
                    <div style={{ color: colors.MUTED, fontSize: 16 }}>Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            fontFamily: "'Barlow Condensed', system-ui, sans-serif",
            background: colors.BG, color: colors.LIGHT, minHeight: '100vh'
        }}>
            <Header
                S={S}
                setTab={t => setS(p => ({ ...p, tab: t }))}
                onReset={resetState}
                onArchive={archiveTournament}
                isAdmin={isAdmin} user={user}
            />

            {S.phase !== 'setup' && S.tournamentName && effectiveTab !== 'history' && (
                <div style={{
                    textAlign: 'center', padding: '6px 20px',
                    background: colors.CARD, borderBottom: `1px solid ${colors.BORDER}`,
                    fontSize: 14, fontWeight: 700, color: colors.GREEN, letterSpacing: 2
                }}>
                    {S.tournamentName}
                </div>
            )}

            {S.showRegenPrompt && (
                <div style={{
                    padding: '16px 24px', background: colors.REGEN_BG,
                    border: `2px solid ${colors.YELLOW}`, borderRadius: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 16, flexWrap: 'wrap'
                }}>
                    <div>
                        <div style={{ color: colors.YELLOW, fontWeight: 700, fontSize: 16 }}>
                            ⚠️ Standings Changed
                        </div>
                        <div style={{ color: colors.LIGHT, fontSize: 13, marginTop: 4 }}>
                            The score change affected pod rankings. Would you like to regenerate the bracket with updated seedings?
                        </div>
                        <div style={{ color: colors.MUTED, fontSize: 11, marginTop: 4 }}>
                            Warning: Regenerating will reset all bracket progress.
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                        <button onClick={regenBracket} style={{
                            padding: '10px 20px', background: colors.YELLOW, color: '#000',
                            border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 13,
                            cursor: 'pointer', fontFamily: 'inherit'
                        }}>
                            Regenerate Bracket
                        </button>
                        <button onClick={dismissRegen} style={{
                            padding: '10px 20px', background: 'transparent',
                            border: `1px solid ${colors.BORDER}`, color: colors.MUTED,
                            borderRadius: 6, fontWeight: 700, fontSize: 13,
                            cursor: 'pointer', fontFamily: 'inherit'
                        }}>
                            Keep Current Bracket
                        </button>
                    </div>
                </div>
            )}

            <div style={{ padding: effectiveTab === 'bracket' ? '24px 20px' : 24 }}>
                {S.phase === 'setup' && effectiveTab !== 'history' && (
                    <SetupView S={S} setS={setS} startTournament={startTournament} isAdmin={isAdmin} />
                )}
                {effectiveTab === 'history' && (
                    <HistoryView history={S.history} isAdmin={isAdmin} onDelete={deleteHistoryItem} />
                )}
                {S.phase !== 'setup' && effectiveTab === 'games' && (
                    <GamesView S={S} name={name} setS={setS} isAdmin={isAdmin} />
                )}
                {S.phase !== 'setup' && effectiveTab === 'standings' && (
                    <StandingsView
                        st={st} name={name} phase={S.phase}
                        podGames={S.podGames} advanceToBracket={advanceToBracket}
                        isAdmin={isAdmin}
                    />
                )}
                {S.phase !== 'setup' && effectiveTab === 'bracket' && (
                    <BracketView S={S} name={name} setS={setS} isAdmin={isAdmin} />
                )}
                {effectiveTab === 'winners' && (
                    <WinnersView S={S} name={name} />
                )}
            </div>

            {modalGame && isAdmin && (
                <ScoreModal
                    game={modalGame} name={name}
                    onSubmit={handleModalSubmit}
                    onClose={() => setS(p => ({ ...p, scoreModal: null }))}
                />
            )}

            {S.rollOff && isAdmin && (
                <RollOffModal
                    player1={S.rollOff.player1}
                    player2={S.rollOff.player2}
                    name={name}
                    onResult={handleRollOffResult}
                />
            )}
        </div>
    );
}
