import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

const TOURNAMENT_ID = 'current';
const tournamentRef = doc(db, 'tournaments', TOURNAMENT_ID);

/**
 * Save tournament state to Firestore.
 * Strips the scoreModal field (local UI state only).
 */
export async function saveTournament(state) {
    try {
        const { scoreModal, ...data } = state;
        await setDoc(tournamentRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Firestore save error:', error);
    }
}

/**
 * Subscribe to real-time tournament updates from Firestore.
 * Returns an unsubscribe function.
 */
export function subscribeTournament(callback) {
    return onSnapshot(tournamentRef, (snap) => {
        if (snap.exists()) {
            callback(snap.data());
        } else {
            callback(null);
        }
    }, (error) => {
        console.error('Firestore subscribe error:', error);
    });
}
