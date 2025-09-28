 # PR: Anubis Messenger – MVP scaffolding (Droid-assisted)

 ## Summary
 - Monorepo with `server/`, `web/`, `android/`, `packages/shared/`.
 - Server (Node+TS, Express+Socket.IO, Prisma+SQLite dev):
   - Registration: generates passphrase (5 words + 12 digits), returns once.
   - Login: by passphrase only via HMAC passKey lookup + Argon2 verify.
   - Server-only user id; unique, editable username (^[a-z0-9_]{3,10}$); editable nickname (^![a-z0-9_]{3,32}$); displayName ≤ 35.
   - Profile update incl. avatar upload; search by nickname/username.
   - Blacklist; media upload; simple messaging with WS notifications.
 - Shared TS package: contracts and validators (zod).
 - Web (React+Vite): light/dark theme (primary #6f0035, secondary #531a50), RU/EN toggle, basic auth UI.
 - Android (Kotlin/Compose, package com.anubis.messenger): theming with brand colors; RU/EN strings; build files scaffolded.

 ## Dev
 ```
 npm install
 cd server && cp .env.example .env # if needed
 npm --workspace @anubis/shared run build
 npm --workspace anubis-server run prisma:generate
 npm --workspace anubis-server run prisma:migrate
 npm run dev
 ```
 Server: http://localhost:4000
 Web:    http://localhost:5173

 ## Render (Prod) notes
 - Switch Prisma datasource provider to `postgresql` and set `DATABASE_URL`.
 - Configure persistent uploads (S3 or Render Disk); current dev stores `server/uploads/`.
 - Set `JWT_SECRET` env var.

 ## Checks
 - TypeScript builds green for shared/server/web.
 - Web production build succeeds.

 ---
 This PR was prepared with assistance from Factory Droid.