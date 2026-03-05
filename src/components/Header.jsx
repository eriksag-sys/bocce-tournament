import { COLORS } from '../logic/constants';
import { Btn } from './ui';
import { signInWithGoogle, signOut } from '../firebase/auth';

export default function Header({ phase, tab, setTab, onReset, isAdmin, user }) {
    const { PANEL, GREEN, MUTED } = COLORS;
    const TABS = phase === 'pods'
        ? ['games', 'standings', 'bracket']
        : ['bracket', 'standings'];

    return (
        <div style={{
            background: PANEL, borderBottom: `2px solid ${GREEN}`,
            padding: '10px 20px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 16, flexWrap: 'wrap'
        }}>
            {/* Logo */}
            <div style={{
                fontSize: 26, fontWeight: 900, letterSpacing: 3,
                color: '#fff', textTransform: 'uppercase'
            }}>
                🎯 <span style={{ color: GREEN }}>BOCCE</span> MANAGER
            </div>

            {/* Tabs */}
            {phase !== 'setup' && (
                <div style={{ display: 'flex', gap: 2 }}>
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            padding: '8px 18px', cursor: 'pointer', fontWeight: 700,
                            letterSpacing: 1, fontSize: 13, textTransform: 'uppercase',
                            background: 'none', border: 'none',
                            borderBottom: `3px solid ${tab === t ? GREEN : 'transparent'}`,
                            color: tab === t ? GREEN : MUTED, transition: 'color .2s',
                        }}>
                            {t}
                        </button>
                    ))}
                </div>
            )}

            {/* Auth + Reset */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {isAdmin ? (
                    <>
                        <span style={{ fontSize: 11, color: GREEN, letterSpacing: 0.5 }}>
                            ✓ {user?.displayName?.split(' ')[0] || 'Admin'}
                        </span>
                        <Btn variant="secondary" style={{ fontSize: 11, padding: '5px 12px' }}
                            onClick={signOut}>
                            Sign Out
                        </Btn>
                        <Btn variant="secondary" style={{ fontSize: 12, padding: '6px 14px' }}
                            onClick={() => {
                                if (window.confirm('Reset all tournament data?')) onReset();
                            }}>
                            ↺ Reset
                        </Btn>
                    </>
                ) : (
                    <Btn variant="secondary" style={{ fontSize: 12, padding: '6px 14px' }}
                        onClick={signInWithGoogle}>
                        🔑 Admin Login
                    </Btn>
                )}
            </div>
        </div>
    );
}
