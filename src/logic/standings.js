import { POD_NAMES } from './constants';

/**
 * Calculate standings for each pod based on completed games.
 * Returns { A: [ranked players], B: [...], ... }
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

        result[pod] = pids
            .map(id => ({ id, ...st[id], diff: st[id].pFor - st[id].pAgainst }))
            .sort((a, b) => {
                if (b.wins !== a.wins) return b.wins - a.wins;
                const aw = a.h2h[b.id] === 'W';
                const bw = b.h2h[a.id] === 'W';
                if (aw && !bw) return -1;
                if (!aw && bw) return 1;
                return b.diff - a.diff;
            })
            .map((p, i) => ({ ...p, rank: i + 1 }));
    });

    return result;
}
