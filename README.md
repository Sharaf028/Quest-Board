# Quest Board

A playful multi-user todo + link-saving site. Sign in with Google, and your
quests and saved links are private to your account, stored in a real
Postgres database.

## 1. Get a database (free)

Pick one:
- [Neon](https://neon.tech) — free Postgres, easiest to set up
- [Supabase](https://supabase.com) — free Postgres + more
- Vercel Postgres / Railway — also work fine

Copy the connection string it gives you (starts with `postgresql://...`).

## 2. Create a Google OAuth client (free)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a project (or use an existing one)
3. Configure the OAuth consent screen (External, add your email as a test user
   while developing)
4. Create an **OAuth client ID** → Application type: **Web application**
5. Under "Authorized redirect URIs" add:
   - `http://localhost:3000/api/auth/callback/google` (for local dev)
   - `https://YOUR-DEPLOYED-DOMAIN/api/auth/callback/google` (add this once you deploy)
6. Copy the **Client ID** and **Client Secret**

## 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
Generate `NEXTAUTH_SECRET` with:

```bash
openssl rand -base64 32
```

## 4. Install and set up the database

```bash
npm install
npx prisma db push
```

`db push` creates all the tables (users, accounts, sessions, todos, links) in
your Postgres database from `prisma/schema.prisma`.

## 5. Run it locally

```bash
npm run dev
```

Visit `http://localhost:3000`, sign in with Google, and try it out.

## 6. Deploy for real (free, on Vercel)

1. Push this project to a GitHub repo
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Add the same environment variables from your `.env` (set `NEXTAUTH_URL`
   to your real `https://yourapp.vercel.app` URL)
4. Deploy
5. Go back to Google Cloud Console and add
   `https://yourapp.vercel.app/api/auth/callback/google` to the authorized
   redirect URIs
6. Once you're ready for the public (not just you), switch the OAuth consent
   screen from "Testing" to "In production" in Google Cloud Console —
   otherwise only emails you've added as test users can sign in.

## Updating an existing deployment (added tags/due dates/pages)

If you already had this running, the database schema changed (todos now
have `tag` and `dueDate`). Pull the new code, then run:

```bash
npx prisma db push
```

This updates your existing Neon database in place — no data is lost.

## Pages

- `/` — public landing page (redirects to `/board` if already signed in)
- `/board` — your active quests, with tag filters and due dates
- `/resources` — saved links
- `/archive` — completed quests, grouped by day, with restore/delete
- `/profile` — account info, stats, dark mode, sign out

## How data is kept separate per user

Every todo and link row has a `userId`. Every API route reads the signed-in
user's ID from the session and filters (or writes) using that ID only — so
one person can never see or edit another person's data. Passwords are never
handled directly; Google does the authentication and NextAuth stores only a
session tied to the verified Google account.

## Project structure

```
src/app/                  Pages and API routes (Next.js App Router)
src/app/api/auth/         NextAuth (Google sign-in)
src/app/api/todos/        Todo CRUD, scoped to the signed-in user
src/app/api/links/        Link CRUD, scoped to the signed-in user
src/app/api/streak/       Daily streak tracking
src/components/           QuestBoard (main UI) and SignIn screen
prisma/schema.prisma      Database schema
```
