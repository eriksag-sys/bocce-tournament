import { POD_NAMES, SEED_ORDER, B_COURTS } from './constants';

/**
 * Check if a roll-off is needed at the 16th/17th seed boundary.
 * Returns null if no roll-off needed, or { player1, player2 } if tied.
 */
export function checkForRollOff(standings) {
    const r3 = [];
    POD_NAMES.forEach(pod => {
        const s = standings[pod] || [];
        if (s[2]) r3.push(s[2]);
    });

    // Sort 3rd-place finishers by wins (desc) then diff (desc)
    r3.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.diff - a.diff;
    });

    // Only need 4 of 6 third-place finishers. Check 4th and 5th (index 3 and 4).
    if (r3.length >= 5) {
        const p4 = r3[3];
        const p5 = r3[4];
        if (p4.wins === p5.wins && p4.diff === p5.diff) {
            return { player1: p4, player2: p5 };
        }
    }
    return null;
}

/**
 * Generate bracket games from pod standings.
 * rollOffWinnerId: if provided, the winner of the roll-off gets the last bracket spot.
 * Returns { bracketSeeds, bracketGames }
 */
export function generateBracket(standings, rollOffWinnerId) {
    const r1 = [], r2 = [], r3 = [];

    POD_NAMES.forEach(pod => {
        const s = standings[pod] || [];
        if (s[0]) r1.push(s[0]);
        if (s[1]) r2.push(s[1]);
        if (s[2]) r3.push(s[2]);
    });

    // Sort cross-pod tiers by wins (desc) then point differential (desc)
    [r1, r2, r3].forEach(arr => arr.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.diff - a.diff;
    }));

    // If roll-off was needed, ensure the winner is in the top 4 of r3
    if (rollOffWinnerId && r3.length >= 5) {
        const winnerIdx = r3.findIndex(p => p.id === rollOffWinnerId);
        if (winnerIdx >= 4) {
            // Swap winner into position 3 (the last qualifying spot)
            const temp = r3[3];
            r3[3] = r3[winnerIdx];
            r3[winnerIdx] = temp;
        }
    }

    const bracketSeeds = [
        ...r1.map((p, i) => ({ pid: p.id, seed: i + 1, diff: p.diff, wins: p.wins })),
        ...r2.map((p, i) => ({ pid: p.id, seed: i + 7, diff: p.diff, wins: p.wins })),
        ...r3.slice(0, 4).map((p, i) => ({ pid: p.id, seed: i + 13, diff: p.diff, wins: p.wins })),
    ];

    const sm = Object.fromEntries(bracketSeeds.map(s => [s.seed, s.pid]));

    const bracketGames = [
        // Round of 16 — courts A-H fixed
        ...[...Array(8)].map((_, i) => ({
            id: `r1_${i}`, round: 1, slot: i,
            p1Id: sm[SEED_ORDER[i * 2]] || null,
            p2Id: sm[SEED_ORDER[i * 2 + 1]] || null,
            score1: null, score2: null, status: 'active',
            courtId: B_COURTS[1][i] || null
        })),
        // Quarter finals — courts assigned dynamically later after R16 completes
        ...[...Array(4)].map((_, i) => ({
            id: `qf_${i}`, round: 2, slot: i,
            p1Id: null, p2Id: null,
            score1: null, score2: null, status: 'waiting',
            courtId: B_COURTS[2][i]
        })),
        // Semi finals — fixed courts G, H
        ...[...Array(2)].map((_, i) => ({
            id: `sf_${i}`, round: 3, slot: i,
            p1Id: null, p2Id: null,
            score1: null, score2: null, status: 'waiting',
            courtId: B_COURTS[3][i]
        })),
        // Championship — fixed court E
        {
            id: 'final', round: 4, slot: 0,
            p1Id: null, p2Id: null,
            score1: null, score2: null, status: 'waiting',
            courtId: 'E', label: '🏆 Championship'
        },
        // 3rd Place — fixed court F
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
    let games = bracketGames.map(g => ({ ...g }));
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
        const qfSlot = Math.floor(slot / 2);
        const qfSide = slot % 2 ? 'p2Id' : 'p1Id';
        adv(`qf_${qfSlot}`, qfSide, win);

        // Dynamic QF court assignment: avoid R16 court for advancing players
        const qfIdx = games.findIndex(x => x.id === `qf_${qfSlot}`);
        if (qfIdx >= 0) {
            const qfGame = games[qfIdx];
            if (qfGame.p1Id && qfGame.p2Id) {
                // Both players known — assign best court
                const r16Courts = [];
                games.filter(x => x.round === 1).forEach(x => {
                    if (x.status === 'completed') {
                        const w = x.score1 > x.score2 ? x.p1Id : x.p2Id;
                        if (w === qfGame.p1Id || w === qfGame.p2Id) {
                            r16Courts.push({ pid: w, court: x.courtId });
                        }
                    }
                });
                const p1Court = r16Courts.find(x => x.pid === qfGame.p1Id)?.court;
                const p2Court = r16Courts.find(x => x.pid === qfGame.p2Id)?.court;
                const qfPool = [...B_COURTS[2]];
                // Pick a court neither player just played on
                let best = qfPool.find(c => c !== p1Court && c !== p2Court);
                if (!best) best = qfPool.find(c => c !== p1Court || c !== p2Court);
                if (!best) best = qfPool[qfSlot]; // fallback to default
                games[qfIdx] = { ...games[qfIdx], courtId: best };
            }
        }
    } else if (round === 2) {
        adv(`sf_${Math.floor(slot / 2)}`, slot % 2 ? 'p2Id' : 'p1Id', win);
    } else if (round === 3) {
        adv('final', slot ? 'p2Id' : 'p1Id', win);
        adv('third', slot ? 'p2Id' : 'p1Id', lose);
    }

    return games;
}

/**
 * Re-score a completed bracket game with cascading.
 * If the winner changes, clears all dependent downstream games.
 * Returns updated bracketGames array.
 */
export function rescoreBracketGame(bracketGames, gameId, s1, s2) {
    let games = bracketGames.map(g => ({ ...g }));
    const gi = games.findIndex(g => g.id === gameId);
    if (gi < 0) return games;

    const g = games[gi];
    const oldWin = g.score1 > g.score2 ? g.p1Id : g.p2Id;
    const newWin = s1 > s2 ? g.p1Id : g.p2Id;

    // Just update score if winner didn't change
    if (oldWin === newWin) {
        games[gi] = { ...g, score1: s1, score2: s2 };
        return games;
    }

    // Winner changed — need to cascade
    // First reset this game's score and mark completed with new scores
    games[gi] = { ...g, score1: s1, score2: s2, status: 'completed' };

    const newLose = s1 > s2 ? g.p2Id : g.p1Id;

    // Clear all downstream games that this game feeds into
    clearDownstream(games, g.round, g.slot);

    // Re-advance the new winner
    const { round, slot } = g;
    const adv = (id, side, player) => {
        const idx = games.findIndex(x => x.id === id);
        if (idx < 0) return;
        const u = { ...games[idx], [side]: player };
        if (u.p1Id && u.p2Id) u.status = 'active';
        games[idx] = u;
    };

    if (round === 1) {
        adv(`qf_${Math.floor(slot / 2)}`, slot % 2 ? 'p2Id' : 'p1Id', newWin);
    } else if (round === 2) {
        adv(`sf_${Math.floor(slot / 2)}`, slot % 2 ? 'p2Id' : 'p1Id', newWin);
    } else if (round === 3) {
        adv('final', slot ? 'p2Id' : 'p1Id', newWin);
        adv('third', slot ? 'p2Id' : 'p1Id', newLose);
    }

    return games;
}

/**
 * Clear downstream bracket games that depend on a given round/slot result.
 */
function clearDownstream(games, fromRound, fromSlot) {
    // Determine which game this feeds into
    let nextId, nextSide;
    if (fromRound === 1) {
        nextId = `qf_${Math.floor(fromSlot / 2)}`;
        nextSide = fromSlot % 2 ? 'p2Id' : 'p1Id';
    } else if (fromRound === 2) {
        nextId = `sf_${Math.floor(fromSlot / 2)}`;
        nextSide = fromSlot % 2 ? 'p2Id' : 'p1Id';
    } else if (fromRound === 3) {
        // Feeds into both final and third
        const finalId = 'final';
        const thirdId = 'third';
        const side = fromSlot ? 'p2Id' : 'p1Id';
        resetGame(games, finalId, side);
        resetGame(games, thirdId, side);
        // Final and third are round 4, no further downstream
        return;
    } else {
        return; // Round 4 has no downstream
    }

    const idx = games.findIndex(x => x.id === nextId);
    if (idx < 0) return;

    const nextGame = games[idx];

    // Clear the player slot and reset status
    games[idx] = {
        ...nextGame,
        [nextSide]: null,
        score1: null, score2: null,
        status: 'waiting'
    };

    // If this next game was completed, its downstream also needs clearing
    if (nextGame.status === 'completed') {
        clearDownstream(games, nextGame.round, nextGame.slot);
    }
}

/**
 * Reset a single game's player slot.
 */
function resetGame(games, id, side) {
    const idx = games.findIndex(x => x.id === id);
    if (idx < 0) return;
    const g = games[idx];

    // If this game was completed, clear its downstream too
    if (g.status === 'completed') {
        clearDownstream(games, g.round, g.slot);
    }

    games[idx] = {
        ...g,
        [side]: null,
        score1: null, score2: null,
        status: 'waiting'
    };
}
