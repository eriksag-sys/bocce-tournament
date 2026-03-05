import { POD_NAMES, SEED_ORDER, B_COURTS } from './constants';

/**
 * Generate bracket games from pod standings.
 * Returns { bracketSeeds, bracketGames }
 */
export function generateBracket(standings) {
    const r1 = [], r2 = [], r3 = [];

    POD_NAMES.forEach(pod => {
        const s = standings[pod] || [];
        if (s[0]) r1.push(s[0]);
        if (s[1]) r2.push(s[1]);
        if (s[2]) r3.push(s[2]);
    });

    [r1, r2, r3].forEach(arr => arr.sort((a, b) => b.diff - a.diff));

    const bracketSeeds = [
        ...r1.map((p, i) => ({ pid: p.id, seed: i + 1, diff: p.diff })),
        ...r2.map((p, i) => ({ pid: p.id, seed: i + 7, diff: p.diff })),
        ...r3.slice(0, 4).map((p, i) => ({ pid: p.id, seed: i + 13, diff: p.diff })),
    ];

    const sm = Object.fromEntries(bracketSeeds.map(s => [s.seed, s.pid]));

    const bracketGames = [
        // Round of 16
        ...[...Array(8)].map((_, i) => ({
            id: `r1_${i}`, round: 1, slot: i,
            p1Id: sm[SEED_ORDER[i * 2]] || null,
            p2Id: sm[SEED_ORDER[i * 2 + 1]] || null,
            score1: null, score2: null, status: 'active',
            courtId: B_COURTS[1][i] || null
        })),
        // Quarter finals
        ...[...Array(4)].map((_, i) => ({
            id: `qf_${i}`, round: 2, slot: i,
            p1Id: null, p2Id: null,
            score1: null, score2: null, status: 'waiting',
            courtId: B_COURTS[2][i]
        })),
        // Semi finals
        ...[...Array(2)].map((_, i) => ({
            id: `sf_${i}`, round: 3, slot: i,
            p1Id: null, p2Id: null,
            score1: null, score2: null, status: 'waiting',
            courtId: B_COURTS[3][i]
        })),
        // Championship
        {
            id: 'final', round: 4, slot: 0,
            p1Id: null, p2Id: null,
            score1: null, score2: null, status: 'waiting',
            courtId: 'E', label: '🏆 Championship'
        },
        // 3rd Place
        {
            id: 'third', round: 4, slot: 1,
            p1Id: null, p2Id: null,
            score1: null, score2: null, status: 'waiting',
            courtId: 'F', label: '3rd Place'
        },
    ];

    return { bracketSeeds, bracketGames };
}

/**
 * Advance bracket after a score is entered.
 * Returns updated bracketGames array.
 */
export function advanceBracketGame(bracketGames, gameId, s1, s2) {
    let games = [...bracketGames];
    const gi = games.findIndex(g => g.id === gameId);
    if (gi < 0) return games;

    const g = games[gi];
    games[gi] = { ...g, score1: s1, score2: s2, status: 'completed' };

    const win = s1 > s2 ? g.p1Id : g.p2Id;
    const lose = s1 > s2 ? g.p2Id : g.p1Id;

    const adv = (id, side, player) => {
        const idx = games.findIndex(x => x.id === id);
        if (idx < 0) return;
        const u = { ...games[idx], [side]: player };
        if (u.p1Id && u.p2Id) u.status = 'active';
        games[idx] = u;
    };

    const { round, slot } = g;
    if (round === 1) {
        adv(`qf_${Math.floor(slot / 2)}`, slot % 2 ? 'p2Id' : 'p1Id', win);
    } else if (round === 2) {
        adv(`sf_${Math.floor(slot / 2)}`, slot % 2 ? 'p2Id' : 'p1Id', win);
    } else if (round === 3) {
        adv('final', slot ? 'p2Id' : 'p1Id', win);
        adv('third', slot ? 'p2Id' : 'p1Id', lose);
    }

    return games;
}
