import { useState, useEffect, useCallback, useRef } from 'react';
import { BLANK_STATE } from '../logic/constants';
import { saveTournament, subscribeTournament } from '../firebase/tournament';

/**
 * Hook to manage tournament state with Firestore sync.
 * - Loads from Firestore on mount (with localStorage fallback)
 * - Saves to Firestore on state changes (admin only)
 * - Subscribes to real-time updates for all viewers
 */
export function useTournament(isAdmin) {
    const [state, setStateRaw] = useState(() => {
        try {
            const s = localStorage.getItem('bocce_v5');
            return s ? JSON.parse(s) : BLANK_STATE;
        } catch {
            return BLANK_STATE;
        }
    });

    const isRemoteUpdate = useRef(false);
    const lastSavedJson = useRef('');

    // Subscribe to Firestore real-time updates
    useEffect(() => {
        const unsub = subscribeTournament((data) => {
            if (data) {
                // Preserve local UI state (scoreModal)
                isRemoteUpdate.current = true;
                const merged = { ...BLANK_STATE, ...data, scoreModal: null };
                lastSavedJson.current = JSON.stringify(data);
                setStateRaw(prev => ({
                    ...merged,
                    scoreModal: prev.scoreModal  // keep local modal state
                }));
                // Also cache locally for offline
                localStorage.setItem('bocce_v5', JSON.stringify(merged));
            }
        });
        return unsub;
    }, []);

    // Save to Firestore when state changes (admin only)
    useEffect(() => {
        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
        }

        // Always save to localStorage
        localStorage.setItem('bocce_v5', JSON.stringify(state));

        // Only admins write to Firestore
        if (isAdmin) {
            const { scoreModal, ...data } = state;
            const json = JSON.stringify(data);
            if (json !== lastSavedJson.current) {
                lastSavedJson.current = json;
                saveTournament(state);
            }
        }
    }, [state, isAdmin]);

    const setState = useCallback((updater) => {
        isRemoteUpdate.current = false;
        setStateRaw(updater);
    }, []);

    const resetState = useCallback(() => {
        isRemoteUpdate.current = false;
        setStateRaw(BLANK_STATE);
        localStorage.removeItem('bocce_v5');
        if (isAdmin) {
            saveTournament(BLANK_STATE);
        }
    }, [isAdmin]);

    return [state, setState, resetState];
}
