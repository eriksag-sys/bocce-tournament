import { useTheme } from '../ThemeContext';
import { Btn } from './ui';
import { signInWithGoogle, signOut } from '../firebase/auth';

export default function Header({ S, setTab, onReset, onArchive, isAdmin, user }) {
    const { colors, isDark, toggle } = useTheme();
    const { PANEL, GREEN, MUTED, YELLOW, BORDER, TEXT } = colors;
    const phase = S.phase;
    const tab = S.tab;

    const TABS = phase === 'setup'
        ? ['setup', 'history']
        : phase === 'finished'
            ? ['winners', 'bracket', 'standings', 'history']
            : phase === 'pods'
                ? ['games', 'standings', 'bracket', 'history']
                : ['bracket', 'standings', 'games', 'history'];

    return (
        <div style={{
            background: PANEL, borderBottom: `2px solid ${GREEN}`,
            padding: '8px 20px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'
        }}>
            {/* Logo + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                    src="/marin-bocce-logo.png" alt="Marin Bocce"
                    style={{ height: 40, width: 'auto', objectFit: 'contain' }}
                />
                <div>
                    <div style={{
                        fontSize: 16, fontWeight: 900, letterSpacing: 2,
                        color: TEXT, textTransform: 'uppercase', lineHeight: 1.1
                    }}>
                        <span style={{ color: GREEN }}>MARIN BOCCE</span>
                    </div>
                    <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: 'uppercase' }}>
                        Tournament Tracker
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '6px 14px', cursor: 'pointer', fontWeight: 700,
                        letterSpacing: 1, fontSize: 12, textTransform: 'uppercase',
                        background: 'none', border: 'none',
                        borderBottom: `3px solid ${tab === t ? GREEN : 'transparent'}`,
                        color: tab === t ? GREEN : MUTED, transition: 'color .2s',
                    }}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Auth + Admin + Theme Toggle */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Theme Toggle */}
                <button onClick={toggle} style={{
                    background: 'none', border: `1px solid ${BORDER}`, borderRadius: 4,
                    cursor: 'pointer', padding: '4px 8px', fontSize: 16, lineHeight: 1,
                    color: MUTED, transition: 'color .2s',
                }} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                    {isDark ? '☀️' : '🌙'}
                </button>

                {isAdmin ? (
                    <>
                        <span style={{ fontSize: 11, color: GREEN, letterSpacing: 0.5 }}>
                            ✓ {user?.displayName?.split(' ')[0] || 'Admin'}
                        </span>
                        <Btn variant="secondary" style={{ fontSize: 10, padding: '4px 10px' }}
                            onClick={signOut}>
                            Sign Out
                        </Btn>
                        {phase !== 'setup' && (
                            <>
                                <Btn variant="secondary" style={{ fontSize: 10, padding: '4px 10px' }}
                                    onClick={() => {
                                        if (window.confirm('⚠️ Save this tournament to history and start fresh?')) {
                                            if (window.confirm('Are you sure? The current tournament will be archived.')) {
                                                onArchive();
                                            }
                                        }
                                    }}>
                                    📋 Archive & New
                                </Btn>
                                <Btn variant="red" style={{ fontSize: 10, padding: '4px 10px' }}
                                    onClick={() => {
                                        const name = S.tournamentName || 'this tournament';
                                        if (window.confirm(`⚠️ CANCEL "${name}"?\n\nThis will discard all current data without saving.`)) {
                                            if (window.confirm('This CANNOT be undone. Are you absolutely sure?')) {
                                                onReset();
                                            }
                                        }
                                    }}>
                                    ✕ Cancel Tournament
                                </Btn>
                            </>
                        )}
                    </>
                ) : (
                    <Btn variant="secondary" style={{ fontSize: 11, padding: '5px 12px' }}
                        onClick={signInWithGoogle}>
                        🔑 Admin
                    </Btn>
                )}
            </div>
        </div>
    );
}
