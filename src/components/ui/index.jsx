import { useTheme } from '../../ThemeContext';

export function Btn({ children, variant = 'primary', onClick, disabled, style = {} }) {
    const { colors } = useTheme();
    const { BORDER, GREEN, YELLOW, RED, CARD, MUTED, LIGHT, BG } = colors;

    return (
        <button disabled={disabled} onClick={onClick} style={{
            padding: '9px 22px', borderRadius: 4, fontWeight: 700, fontSize: 14,
            letterSpacing: 1, cursor: disabled ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase', border: 'none',
            background: disabled ? BORDER
                : variant === 'primary' ? GREEN
                    : variant === 'yellow' ? YELLOW
                        : variant === 'red' ? RED
                            : CARD,
            color: disabled ? MUTED
                : (variant === 'primary' || variant === 'yellow') ? '#fff'
                    : LIGHT,
            opacity: disabled ? 0.6 : 1,
            transition: 'opacity .2s',
            ...style
        }}>
            {children}
        </button>
    );
}

export function Pill({ color, text }) {
    return (
        <span style={{
            background: color + '22', color, border: `1px solid ${color}44`,
            borderRadius: 3, padding: '1px 7px', fontSize: 11, fontWeight: 700,
            letterSpacing: 0.5, display: 'inline-block'
        }}>
            {text}
        </span>
    );
}

export function PlayerRow({ name, score, win }) {
    const { colors } = useTheme();
    const { GREEN, LIGHT, RED } = colors;
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', padding: '3px 0'
        }}>
            <span style={{
                fontWeight: win ? 700 : 400, color: win ? GREEN : LIGHT,
                fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
                {name}
            </span>
            {score != null && (
                <span style={{
                    fontWeight: 900, fontSize: 18,
                    color: win ? GREEN : RED, marginLeft: 8, flexShrink: 0
                }}>
                    {score}
                </span>
            )}
        </div>
    );
}

export function SectionHeader({ children, color }) {
    return (
        <h3 style={{
            color, margin: '0 0 10px', letterSpacing: 1,
            textTransform: 'uppercase', fontSize: 13, fontWeight: 700
        }}>
            {children}
        </h3>
    );
}

export function StatBox({ label, val, col }) {
    const { colors } = useTheme();
    const { CARD, BORDER, MUTED } = colors;
    return (
        <div style={{
            background: CARD, border: `1px solid ${BORDER}`,
            borderRadius: 8, padding: '12px 20px', minWidth: 100
        }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: col }}>{val}</div>
            <div style={{ fontSize: 11, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
        </div>
    );
}
