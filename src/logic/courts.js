import { COURT_ORDER } from './constants';

/**
 * Assign queued games to available courts.
 * Avoids assigning a player to the same court they just played on.
 * courtHistory: { playerId -> lastCourtId }
 * Returns updated games, courts, queue, and courtHistory.
 */
export function assignCourts(games, courts, queue, courtHistory = {}) {
    const g = games.map(x => ({ ...x }));
    const c = Object.fromEntries(
        Object.entries(courts).map(([k, v]) => [k, { ...v }])
    );
    let q = [...queue];
    const hist = { ...courtHistory };

    const avail = COURT_ORDER.filter(cn => !c[cn].gameId);

    const assigned = [];
    const remaining = [];

    // Try to assign each queued game to a non-repeat court
    while (q.length) {
        const gid = q.shift();
        const idx = g.findIndex(x => x.id === gid);
        if (idx < 0) continue;

        const game = g[idx];
        const p1Last = hist[game.p1Id];
        const p2Last = hist[game.p2Id];

        // Prefer a court neither player just played on
        let bestIdx = avail.findIndex(cn => cn !== p1Last && cn !== p2Last);
        // Fall back to a court at least one player didn't just play on
        if (bestIdx < 0) bestIdx = avail.findIndex(cn => cn !== p1Last || cn !== p2Last);
        // Last resort: any available court
        if (bestIdx < 0 && avail.length > 0) bestIdx = 0;

        if (bestIdx >= 0) {
            const court = avail.splice(bestIdx, 1)[0];
            g[idx] = { ...g[idx], status: 'active', courtId: court };
            c[court] = { gameId: gid };
        } else {
            remaining.push(gid);
        }
    }

    q = remaining;

    q.forEach(gid => {
        const idx = g.findIndex(x => x.id === gid);
        if (idx >= 0 && g[idx].status === 'pending') {
            g[idx] = { ...g[idx], status: 'queued' };
        }
    });

    return { games: g, courts: c, queue: q, courtHistory: hist };
}

/**
 * Update court history after a game completes.
 * Records both players' last court.
 */
export function updateCourtHistory(courtHistory, game) {
    if (!game.courtId) return courtHistory;
    return {
        ...courtHistory,
        [game.p1Id]: game.courtId,
        [game.p2Id]: game.courtId,
    };
}
