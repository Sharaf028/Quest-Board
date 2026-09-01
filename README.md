<div align="center">

<img src="public/logo.png" alt="Quest Board logo" width="120" />

# Quest Board

**A playful, gamified todo app for daily tasks and study resources.**

🔗 **[Visit Quest Board](https://your-app.vercel.app)**

</div>

---

## What is Quest Board?

Most todo apps feel like chores. Quest Board turns your daily tasks into
**quests** — complete with a satisfying stamp-and-confetti animation when
you check one off, a streak flame that tracks how many days in a row you've
shown up, and a rotating daily motivational quote to nudge you along.

Alongside your quests, it doubles as a lightweight resource manager: save
links to articles, docs, or anything you're studying, so they live in one
tidy place instead of scattered across a dozen browser tabs.

Sign in with your Google account and everything is yours alone — private,
saved automatically, and there the next time you open the site.

## How it helps

- **Turns tasks into small wins** — the stamp animation and streak counter
  make finishing something feel like progress, not just crossing off a line
- **Keeps you motivated daily** — a new motivational quote greets you every
  time you open the board
- **Organizes what you're studying** — save and revisit useful links in one
  place instead of losing them in your browser history
- **Nothing to set up** — just sign in with Google and start; no accounts,
  passwords, or configuration
- **Private and yours** — every quest and resource is tied to your account
  only; no one else can see or touch it

## Features

- 🚀 **Google sign-in** — one click, no passwords
- 🗡️ **Quests** — add, edit, tag (Study / Personal / Project / Other), and
  set due dates on your tasks
- 📚 **Resources** — save and edit links you want to keep
- 🏆 **Archive** — look back on everything you've completed, grouped by day
- 🔥 **Daily streaks** — a flame that grows the more consistently you show up
- 💬 **Daily motivational quote** — changes automatically once a day
- 🌙 **Dark mode** — toggle it from the nav

## Tech stack

| Layer      | Choice                                                        |
|------------|-----------------------------------------------------------------|
| Framework  | [Next.js](https://nextjs.org) (App Router, React)               |
| Auth       | [NextAuth.js](https://next-auth.js.org) with Google OAuth       |
| Database   | [PostgreSQL](https://www.postgresql.org) via [Prisma](https://prisma.io) ORM |
| Language   | TypeScript                                                      |
| Styling    | Plain CSS (custom design system, no UI framework)                |
| Hosting    | [Vercel](https://vercel.com) + [Neon](https://neon.tech) Postgres |

## Pages

| Page          | What it's for                                       |
|---------------|-------------------------------------------------------|
| Landing page  | Introduces the app and sign-in                       |
| Board         | Your active quests — add, edit, filter, due dates     |
| Resources     | Saved links you're studying or want to revisit        |
| Archive       | Everything you've completed, grouped by day           |
| Profile       | Your stats, streak, and account settings              |

---

## Built with

Next.js · NextAuth.js · Prisma · PostgreSQL · TypeScript
