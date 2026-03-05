import { signInWithPopup, GoogleAuthProvider, signOut as fbSignOut } from 'firebase/auth';
import { auth } from './config';

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error('Sign-in error:', error);
        throw error;
    }
}

export async function signOut() {
    try {
        await fbSignOut(auth);
    } catch (error) {
        console.error('Sign-out error:', error);
        throw error;
    }
}
