import { POD_NAMES } from './constants';

/**
 * Calculate standings for each pod based on completed games.
 * Returns { A: [ranked players], B: [...], ... }
 *
 * Tiebreak order:
 *   1. Wins (most wins ranks highest)
 *   2. Head-to-head (only when exactly 2 players are tied —
 *      if 3+ are tied and h2h is circular, skip to #3)
 *   3. Point differential
 */
export function calcStandings(podGames, pods) {
    const result = {};

    POD_NAMES.forEach(pod => {
        const pids = pods[pod] || [];
        const st = Object.fromEntries(
            pids.map(id => [id, { wins: 0, pFor: 0, pAgainst: 0, h2h: {} }])
        );

        podGames
            .filter(g => g.podId === pod && g.status === 'completed')
            .forEach(({ p1Id, p2Id, score1, score2 }) => {
                st[p1Id].pFor += score1;
                st[p1Id].pAgainst += score2;
                st[p2Id].pFor += score2;
                st[p2Id].pAgainst += score1;
                st[p1Id].h2h[p2Id] = score1 > score2 ? 'W' : 'L';
                st[p2Id].h2h[p1Id] = score2 > score1 ? 'W' : 'L';
                if (score1 > score2) st[p1Id].wins++;
                else st[p2Id].wins++;
            });

        // Build player objects
        const players = pids.map(id => ({
            id, ...st[id], diff: st[id].pFor - st[id].pAgainst
        }));

        // Resolve rankings with proper multi-way tiebreaking
        result[pod] = resolveRankings(players);
    });

    return result;
}

/**
 * Resolve rankings with proper multi-way tiebreaking.
 * Groups by wins, then resolves ties within each group.
 */
function resolveRankings(players) {
    // Group by wins
    const byWins = {};
    players.forEach(p => {
        const w = p.wins;
        if (!byWins[w]) byWins[w] = [];
        byWins[w].push(p);
    });

    // Sort win groups descending
    const sortedWins = Object.keys(byWins).map(Number).sort((a, b) => b - a);

    const ranked = [];
    sortedWins.forEach(w => {
        const group = byWins[w];
        if (group.length === 1) {
            ranked.push(group[0]);
        } else {
            // Resolve ties within this group
            ranked.push(...resolveTiedGroup(group));
        }
    });

    return ranked.map((p, i) => ({ ...p, rank: i + 1 }));
}

/**
 * Resolve a group of players who are tied on wins.
 * Uses h2h when possible, falls through to point differential.
 */
function resolveTiedGroup(group) {
    if (group.length <= 1) return group;

    if (group.length === 2) {
        // Simple 2-way: h2h then diff
        const [a, b] = group;
        if (a.h2h[b.id] === 'W') return [a, b];
        if (b.h2h[a.id] === 'W') return [b, a];
        return group.sort((x, y) => y.diff - x.diff);
    }

    // 3+ way tie: check if one player beat ALL others in the group
    // If so, they rank first. Repeat for remaining.
    const resolved = [];
    let remaining = [...group];

    while (remaining.length > 1) {
        // Find a player who beat everyone else remaining
        const dominant = remaining.find(p =>
            remaining.every(q => q.id === p.id || p.h2h[q.id] === 'W')
        );

        if (dominant) {
            resolved.push(dominant);
            remaining = remaining.filter(p => p.id !== dominant.id);
        } else {
            // No clear h2h winner — sort remaining by point differential
            remaining.sort((a, b) => b.diff - a.diff);
            resolved.push(...remaining);
            remaining = [];
        }
    }

    if (remaining.length === 1) {
        resolved.push(remaining[0]);
    }

    return resolved;
}
