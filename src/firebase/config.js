import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDxqMtMYffVmyA65CKEgkC9eOPUxXV1yvY",
    authDomain: "bocce-tournaments.firebaseapp.com",
    projectId: "bocce-tournaments",
    storageBucket: "bocce-tournaments.firebasestorage.app",
    messagingSenderId: "321731864294",
    appId: "1:321731864294:web:7cd579229d2ed050eefd27",
    measurementId: "G-NY7Y1JN4BB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
