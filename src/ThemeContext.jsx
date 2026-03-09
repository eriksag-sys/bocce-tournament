import { createContext, useContext, useState, useEffect } from 'react';

// ─── DARK PALETTE ───────────────────────────────────────────────────────────
const DARK_COLORS = {
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
    TEXT: '#ffffff',
    DONE_BG: '#0b1a0f',
    DONE_BORDER: '#1a3320',
    ACTIVE_BG: '#0b1524',
    WIN_BG: '#00e67611',
    CHAMP_BG: '#181000',
    REGEN_BG: '#1a1200',
    INPUT_BG: '#101828',
    INPUT_COLOR: '#ffffff',
    OVERLAY: 'rgba(0,0,0,.92)',
};

const DARK_POD_COLORS = {
    A: '#00e676',
    B: '#40c4ff',
    C: '#ffd740',
    D: '#ff6e40',
    E: '#ea80fc',
    F: '#80d8ff',
};

// ─── LIGHT PALETTE ──────────────────────────────────────────────────────────
const LIGHT_COLORS = {
    BG: '#f4f6f9',
    PANEL: '#ffffff',
    CARD: '#ffffff',
    BORDER: '#d8dde6',
    GREEN: '#0d9e4f',
    YELLOW: '#d49a00',
    BLUE: '#0078d4',
    RED: '#d32f2f',
    MUTED: '#7a8599',
    LIGHT: '#3a4355',
    TEXT: '#1a1a2e',
    DONE_BG: '#eaf5ee',
    DONE_BORDER: '#b4d8c0',
    ACTIVE_BG: '#e8f0fe',
    WIN_BG: '#0d9e4f11',
    CHAMP_BG: '#fffbe6',
    REGEN_BG: '#fff8e1',
    INPUT_BG: '#f0f2f5',
    INPUT_COLOR: '#1a1a2e',
    OVERLAY: 'rgba(0,0,0,.55)',
};

const LIGHT_POD_COLORS = {
    A: '#0d9e4f',
    B: '#0078d4',
    C: '#d49a00',
    D: '#e64a19',
    E: '#9c27b0',
    F: '#0277bd',
};

// ─── CONTEXT ────────────────────────────────────────────────────────────────
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('bocce-theme');
        return saved === 'dark';
    });

    useEffect(() => {
        localStorage.setItem('bocce-theme', isDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const value = {
        colors: isDark ? DARK_COLORS : LIGHT_COLORS,
        podColors: isDark ? DARK_POD_COLORS : LIGHT_POD_COLORS,
        isDark,
        toggle: () => setIsDark(d => !d),
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
