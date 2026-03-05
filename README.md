# 🎯 Bocce Tournament Manager

A real-time bocce tournament management app with pod play, bracket generation, and live scoring.

## Features

- **Pod Play**: 24 players, 6 pods of 4, round-robin format
- **Auto Court Assignment**: 10 courts, automatic queue management
- **Live Standings**: Wins, head-to-head tiebreakers, point differentials
- **Bracket Generation**: Seeded 16-team single elimination with 3rd place game
- **Real-Time Sync**: All viewers see live score updates via Firebase
- **Admin Access**: Google Sign-In for tournament administrators
- **Public View**: Anyone can see scores and brackets without logging in

## Tech Stack

- **React** + **Vite** for the frontend
- **Firebase Firestore** for real-time data sync
- **Firebase Auth** (Google Sign-In) for admin access

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Open your **Bocce-Tournaments** project
3. Go to Project Settings → Your Apps → Web App → copy the config
4. Paste your config into `src/firebase/config.js`

### 3. Enable Firebase Services

In the Firebase Console:
- **Authentication** → Sign-in method → Enable **Google**
- **Firestore Database** → Create database → Start in test mode

### 4. Firestore Security Rules

In Firestore → Rules, paste:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tournaments/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Run Locally
```bash
npm run dev
```

## Usage

- **Admins**: Click "Admin Login" → Sign in with Google → Full control
- **Viewers**: Visit the page → See live scores, standings, and brackets (read-only)

## License

MIT
