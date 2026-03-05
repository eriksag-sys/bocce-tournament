import { COURT_ORDER } from './constants';

/**
 * Assign queued games to available courts.
 * Returns updated games, courts, and queue.
 */
export function assignCourts(games, courts, queue) {
    const g = games.map(x => ({ ...x }));
    const c = Object.fromEntries(
        Object.entries(courts).map(([k, v]) => [k, { ...v }])
    );
    let q = [...queue];

    const avail = COURT_ORDER.filter(cn => !c[cn].gameId);

    while (avail.length && q.length) {
        const court = avail.shift();
        const gid = q.shift();
        const idx = g.findIndex(x => x.id === gid);
        if (idx >= 0) {
            g[idx] = { ...g[idx], status: 'active', courtId: court };
            c[court] = { gameId: gid };
        }
    }

    q.forEach(gid => {
        const idx = g.findIndex(x => x.id === gid);
        if (idx >= 0 && g[idx].status === 'pending') {
            g[idx] = { ...g[idx], status: 'queued' };
        }
    });

    return { games: g, courts: c, queue: q };
}
