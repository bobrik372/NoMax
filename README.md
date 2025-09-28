# Anubis Messenger (Monorepo)

Folders:
- `server/` – Node.js + TypeScript API + WebSocket (Express + Socket.IO), Prisma ORM. SQLite in dev; Postgres-ready for Render.
- `web/` – React + Vite + TypeScript web client with light/dark theme, RU/EN.
- `android/` – Kotlin + Jetpack Compose Android client (package `com.anubis.messenger`).
- `packages/shared/` – Shared TypeScript contracts and validators.

Run (dev):
```
npm install
npm run dev
```

Build all:
```
npm run build
```

Notes:
- Username: `^[a-z0-9_]{3,10}$` (unique, editable)
- Nickname: `^![a-z0-9_]{3,32}$` (editable)
- Display name ≤ 35 chars
- Registration shows one-time passphrase (5 English words + 12 digits). Login by passphrase only. Can change passphrase in profile.

Branding:
- Name: Anubis
- Primary: `#6f0035`
- Secondary: `#531a50`
