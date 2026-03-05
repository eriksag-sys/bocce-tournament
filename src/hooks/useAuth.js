import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

// ─── ADMIN WHITELIST ────────────────────────────────────────────────────────
// Only these email addresses get admin access.
// Everyone else sees the read-only public view.
const ADMIN_EMAILS = [
    'eriksag@gmail.com', 'crowl.dan@gmail.com', 'j.bova.23@gmail.com'
    // Add more admins here, e.g.:
    // 'another-admin@gmail.com',
];

/**
 * Hook to track Firebase auth state.
 * Returns { user, loading, isAdmin }
 */
export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return unsub;
    }, []);

    return {
        user,
        loading,
        isAdmin: !!user && ADMIN_EMAILS.includes(user.email),
    };
}
