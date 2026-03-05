// ─── CONSTANTS ──────────────────────────────────────────────────────────────
export const POD_NAMES = ['A', 'B', 'C', 'D', 'E', 'F'];
export const COURT_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', '1', '2'];

// Round-robin pairs for 4 players (by index 0-3)
export const RR = [
    [[0, 1], [2, 3]],
    [[0, 2], [1, 3]],
    [[0, 3], [1, 2]]
];

// Standard 16-team bracket seeding layout
export const SEED_ORDER = [1, 16, 8, 9, 5, 12, 4, 13, 3, 14, 6, 11, 7, 10, 2, 15];

// Court assignments per bracket round
export const B_COURTS = {
    1: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    2: ['A', 'B', 'C', 'D'],
    3: ['G', 'H'],
    4: ['E', 'F']
};

// ─── COLORS ─────────────────────────────────────────────────────────────────
export const COLORS = {
    BG: '#060a14',
    PANEL: '#0b1020',
    CARD: '#101828',
    BORDER: '#1c2b47',
    GREEN: '#00e676',
    YELLOW: '#ffd740',
    BLUE: '#40c4ff',
    RED: '#ff5252',
    MUTED: '#4a5a7a',
    LIGHT: '#c0ccde',
};

export const POD_COLORS = {
    A: COLORS.GREEN,
    B: COLORS.BLUE,
    C: COLORS.YELLOW,
    D: '#ff6e40',
    E: '#ea80fc',
    F: '#80d8ff'
};

// ─── BLANK STATE ────────────────────────────────────────────────────────────
export const BLANK_TOURNAMENT = {
    phase: 'setup',
    isTeams: false,
    tournamentName: '',
    players: [],
    pods: {},
    courts: Object.fromEntries(COURT_ORDER.map(c => [c, { gameId: null }])),
    podGames: [],
    queue: [],
    scoreModal: null,
    bracketSeeds: [],
    bracketGames: [],
    tab: 'games',
};

export const BLANK_STATE = {
    ...BLANK_TOURNAMENT,
    history: [],
};

// ─── HELPERS ────────────────────────────────────────────────────────────────
export const shuffle = (a) => {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) {
        const j = 0 | (Math.random() * (i + 1));
        [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
};
