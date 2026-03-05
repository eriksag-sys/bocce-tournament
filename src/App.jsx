import { useCallback } from 'react';
import { BLANK_STATE, BLANK_TOURNAMENT, COLORS, POD_NAMES, COURT_ORDER, RR, shuffle } from './logic/constants';
import { assignCourts } from './logic/courts';
import { calcStandings } from './logic/standings';
import { generateBracket, advanceBracketGame } from './logic/bracket';
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

export default function App() {
    const { user, loading, isAdmin } = useAuth();
    const [S, setS, resetState, archiveTournament, deleteHistoryItem] = useTournament(isAdmin);

    const name = useCallback(
        id => (S.players.find(p => p.id === id) || { name: 'TBD' }).name,
        [S.players]
    );

    const st = S.phase !== 'setup' ? calcStandings(S.podGames, S.pods) : {};

    // Auto-detect "finished" state (both finals completed)
    const isFinished = S.phase === 'bracket' && S.bracketGames?.length > 0 &&
        S.bracketGames.find(g => g.id === 'final')?.status === 'completed' &&
        S.bracketGames.find(g => g.id === 'third')?.status === 'completed';

    // If finished and tab is still 'bracket', switch to 'winners'
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
        const result = assignCourts(podGames, courts, queue);

        setS(prev => ({
            ...BLANK_TOURNAMENT,
            history: prev.history || [],
            phase: 'pods', isTeams: prev.isTeams, tournamentName: prev.tournamentName,
            players, pods,
            podGames: result.games, courts: result.courts, queue: result.queue, tab: 'games'
        }));
    }, [setS]);

    // ── Submit Pod Score ──────────────────────────────────────────────────────
    const submitPodScore = useCallback((gameId, s1, s2) => {
        setS(prev => {
            const done = prev.podGames.find(g => g.id === gameId);
            if (!done) return prev;

            let games = prev.podGames.map(g =>
                g.id === gameId ? { ...g, score1: s1, score2: s2, status: 'completed' } : g
            );

            let courts = Object.fromEntries(
                Object.entries(prev.courts).map(([k, v]) => [k, { ...v }])
            );
            if (done.courtId) courts[done.courtId] = { gameId: null };

            let queue = [...prev.queue];

            POD_NAMES.forEach(pod => {
                for (let r = 2; r <= 3; r++) {
                    const prevR = games.filter(g => g.podId === pod && g.round === r - 1);
                    if (!prevR.every(g => g.status === 'completed')) continue;
                    games.filter(g => g.podId === pod && g.round === r && g.status === 'pending')
                        .forEach(g => { if (!queue.includes(g.id)) queue.push(g.id); });
                }
            });

            const result = assignCourts(games, courts, queue);
            const allDone = result.games.every(g => g.status === 'completed');

            return {
                ...prev,
                podGames: result.games, courts: result.courts, queue: result.queue,
                scoreModal: null, tab: allDone ? 'standings' : prev.tab
            };
        });
    }, [setS]);

    // ── Advance to Bracket ────────────────────────────────────────────────────
    const advanceToBracket = useCallback(() => {
        const { bracketSeeds, bracketGames } = generateBracket(st);
        setS(prev => ({
            ...prev, phase: 'bracket', bracketSeeds, bracketGames, tab: 'bracket'
        }));
    }, [st, setS]);

    // ── Submit Bracket Score ──────────────────────────────────────────────────
    const submitBracketScore = useCallback((gameId, s1, s2) => {
        setS(prev => {
            const newBracket = advanceBracketGame(prev.bracketGames, gameId, s1, s2);
            // Check if tournament is finished after this score
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
        if (S.phase === 'pods') submitPodScore(S.scoreModal, s1, s2);
        else submitBracketScore(S.scoreModal, s1, s2);
    }, [S.scoreModal, S.phase, submitPodScore, submitBracketScore]);

    const modalGame = S.scoreModal
        ? (S.podGames.find(g => g.id === S.scoreModal) || S.bracketGames?.find(g => g.id === S.scoreModal))
        : null;

    if (loading) {
        return (
            <div style={{
                fontFamily: "'Barlow Condensed', system-ui, sans-serif",
                background: COLORS.BG, color: COLORS.LIGHT, minHeight: '100vh',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <img src="/marin-bocce-logo.png" alt="Marin Bocce" style={{ height: 80, marginBottom: 12 }} />
                    <div style={{ color: COLORS.MUTED, fontSize: 16 }}>Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            fontFamily: "'Barlow Condensed', system-ui, sans-serif",
            background: COLORS.BG, color: COLORS.LIGHT, minHeight: '100vh'
        }}>
            <Header
                S={S}
                setTab={t => setS(p => ({ ...p, tab: t }))}
                onReset={resetState}
                onArchive={archiveTournament}
                isAdmin={isAdmin} user={user}
            />

            {/* Tournament name banner */}
            {S.phase !== 'setup' && S.tournamentName && effectiveTab !== 'history' && (
                <div style={{
                    textAlign: 'center', padding: '6px 20px',
                    background: COLORS.CARD, borderBottom: `1px solid ${COLORS.BORDER}`,
                    fontSize: 14, fontWeight: 700, color: COLORS.GREEN, letterSpacing: 2
                }}>
                    {S.tournamentName}
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
        </div>
    );
}
