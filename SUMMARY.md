# ML Outliers - Complete Project Summary

> **Purpose of this document**: After reading this, a junior engineer should go from knowing nothing about the project to understanding everything about the architecture, leaderboard system, and how all the pieces connect.

---

## Table of Contents
1. [What is ML Outliers?](#what-is-ml-outliers)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Authentication Flow (Clerk)](#authentication-flow-clerk)
6. [User Registration & Username System](#user-registration--username-system)
7. [The Leaderboard System](#the-leaderboard-system)
8. [Submission & Scoring System](#submission--scoring-system)
9. [API Routes Reference](#api-routes-reference)
10. [Environment Variables](#environment-variables)
11. [Common Development Tasks](#common-development-tasks)

---

## What is ML Outliers?

ML Outliers is an educational platform that teaches "Data Sense" - the intuition to look at messy data and immediately know which ML model to use and why. Instead of treating ML as a black box, users learn to peer inside.

**Core Philosophy**: "Syntax is easy, Intuition is hard."

Users solve challenges by:
1. Looking at a visualization of rigged/pathological data
2. Identifying the problem (e.g., "This data needs log transformation")
3. Getting their answer semantically evaluated against an expert answer

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Frontend** | React 19 with React Compiler |
| **Authentication** | Clerk (OAuth/email) |
| **Database** | PostgreSQL (Neon serverless) |
| **ORM** | Drizzle ORM |
| **AI Evaluation** | Transformers.js (MiniLM for semantic similarity) |
| **Animations** | Framer Motion |
| **Deployment** | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── api/                         # All API routes
│   │   ├── leaderboard/route.ts     # GET leaderboard data
│   │   ├── profile/[userId]/route.ts # GET user profile
│   │   ├── sync-user/route.ts       # POST user registration
│   │   ├── update-username/route.ts # POST change username
│   │   ├── check-answer/route.js    # POST answer evaluation
│   │   └── webhooks/clerk/route.ts  # Clerk webhook handler
│   │
│   ├── home/page.js                 # Main dashboard after login
│   ├── leaderboard/page.js          # Leaderboard page
│   ├── profile/[userId]/page.js     # Public user profile
│   ├── solve/[id]/page.js           # Dynamic challenge page
│   └── layout.js                    # Root layout with Clerk
│
├── db/
│   ├── schema.ts                    # Database tables (Drizzle)
│   ├── index.ts                     # Database client
│   └── queries/
│       ├── leaderboard.ts           # Leaderboard queries
│       ├── users.ts                 # User profile queries
│       └── submissions.ts           # Submission tracking
│
├── problems/                        # Challenge modules (Registry Pattern)
│   ├── index.js                     # THE REGISTRY - maps IDs to modules
│   └── [problem-slug]/              # Each challenge is self-contained
│       ├── info.js                  # Metadata + expert answer
│       ├── Visual.jsx               # Animated visualization
│       └── data.json                # Rigged dataset
│
├── components/shared/               # Reusable UI components
├── lib/                             # Utilities
└── middleware.js                    # Protected routes
```

---

## Database Schema

### Tables Overview

We have 4 main tables in PostgreSQL (Neon):

```
┌─────────────────┐     ┌─────────────────┐
│     users       │     │    problems     │
├─────────────────┤     ├─────────────────┤
│ id (UUID)       │     │ id (serial)     │
│ clerkId (text)  │     │ slug (text)     │
│ email           │     │ title           │
│ username        │     │ module          │
│ fullName        │     │ difficulty      │
│ avatarUrl       │     │ basePoints      │
│ totalPoints     │     │ isPublished     │
│ currentStreak   │     └─────────────────┘
│ longestStreak   │              │
│ lastActivityDate│              │
└─────────────────┘              │
        │                        │
        │     ┌──────────────────┴──────────────────┐
        │     │                                     │
        ▼     ▼                                     ▼
┌─────────────────────────┐           ┌─────────────────────────┐
│      submissions        │           │     userProgress        │
├─────────────────────────┤           ├─────────────────────────┤
│ id (serial)             │           │ id (serial)             │
│ userId (FK → users)     │           │ userId (FK → users)     │
│ problemId (FK → problems)│          │ problemId (FK → problems)│
│ userAnswer              │           │ status (enum)           │
│ isCorrect               │           │ attemptsCount           │
│ submissionTimeSeconds   │           │ completedAt             │
│ pointsAwarded           │           │ fastestTimeSeconds      │
│ submittedAt             │           │ pointsEarned            │
└─────────────────────────┘           └─────────────────────────┘
```

### Key Relationships

- **users.clerkId** → Links to Clerk authentication
- **submissions** → Records every answer attempt
- **userProgress** → One record per user-problem pair (tracks completion status)

### Schema File Location
`src/db/schema.ts`

---

## Authentication Flow (Clerk)

### How Users Sign Up

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  User visits │───▶│ Clerk Sign-up│───▶│ Clerk sends  │───▶│ User created │
│  /sign-up    │    │ (OAuth/Email)│    │ webhook      │    │ in database  │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                               │
                                               ▼
                                     POST /api/webhooks/clerk
                                     Event: "user.created"
```

### Webhook Events Handled

| Event | What Happens |
|-------|--------------|
| `user.created` | Insert new row in `users` table with Clerk data |
| `user.updated` | Update email, name, avatar in `users` table |
| `user.deleted` | Delete user and all their submissions/progress |

### Webhook Security

The webhook at `/api/webhooks/clerk` uses **Svix** to verify signatures:

```typescript
// Verification headers required:
- svix-id
- svix-timestamp
- svix-signature

// Verified against CLERK_WEBHOOK_SECRET
```

---

## User Registration & Username System

### The Full Registration Flow

```
1. User signs up via Clerk
         │
         ▼
2. Clerk webhook fires → user.created event
         │
         ▼
3. Webhook handler creates user in DB (no username yet)
         │
         ▼
4. User redirected to /home
         │
         ▼
5. /home page calls GET /api/sync-user
         │
         ▼
6. API returns status: "needs_username"
         │
         ▼
7. Frontend shows "Choose Username" modal
         │
         ▼
8. User enters username → POST /api/sync-user { username: "..." }
         │
         ▼
9. Username saved → User can now use the app
```

### Username Validation Rules

Located in `/api/update-username/route.ts`:

- **Length**: 3-20 characters
- **Characters**: Alphanumeric + underscores only (`^[a-zA-Z0-9_]+$`)
- **Uniqueness**: Must be unique across all users
- **Reserved Names**: Cannot use: admin, moderator, mloutliers, support, help, etc.

### API Response Statuses

| Status | Meaning |
|--------|---------|
| `newly_registered` | User just created via webhook |
| `already_registered` | User exists with username |
| `needs_username` | User exists but no username set |
| `username_set` | Username was just saved |
| `username_taken` | Someone else has this username |
| `invalid_username` | Fails validation rules |

### Changing Username

Users can change their username from /home:
1. Click ⚙️ settings button
2. Select "Change Username"
3. Enter new username → POST `/api/update-username`

---

## The Leaderboard System

### How Rankings Work

**Primary Sort**: Number of exercises completed (DESC)
**Secondary Sort**: Average fastest time (ASC)

Users with 0 completed exercises get "-" as their rank.

### Leaderboard Filters

| Filter | Query Logic |
|--------|-------------|
| **All-Time** | All completed exercises ever |
| **Monthly** | Completed exercises this calendar month |
| **Weekly** | Completed exercises this calendar week |

### Database Query (Simplified)

```sql
SELECT
  u.id,
  u.username,
  u.avatarUrl,
  COUNT(DISTINCT up.problemId) as exercisesCompleted,
  AVG(up.fastestTimeSeconds) as avgTime
FROM users u
LEFT JOIN userProgress up ON u.id = up.userId
WHERE up.status = 'completed'
  AND up.completedAt >= [time_filter]
GROUP BY u.id
ORDER BY exercisesCompleted DESC, avgTime ASC
LIMIT 100
```

### Leaderboard API

```
GET /api/leaderboard?filter=all-time&limit=100

Response:
{
  "leaderboard": [
    {
      "userId": "uuid",
      "clerkId": "clerk_xxx",
      "username": "john_doe",
      "fullName": "John Doe",
      "avatarUrl": "https://...",
      "totalPoints": 500,
      "exercisesCompleted": 5,
      "averageFastestTime": 120.5,
      "rank": 1
    }
  ],
  "currentUserRank": { ... },  // Signed-in user's data
  "filter": "all-time",
  "count": 42
}
```

### Leaderboard UI Components

**Location**: `src/app/leaderboard/page.js`

```
┌────────────────────────────────────────────────────────┐
│                     LEADERBOARD                        │
│                                                        │
│  [All-Time] [Monthly] [Weekly]    ← Filter tabs        │
│                                                        │
│        🥈           🥇           🥉                    │
│       #2           #1           #3         ← Podium    │
│     Avatar       Avatar       Avatar                   │
│     Name         Name         Name                     │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Rank │ User │ Exercises │ Avg Time │ Points     │  │
│  ├──────┼──────┼───────────┼──────────┼────────────┤  │
│  │  4   │ ...  │    10     │  2m 15s  │   1000     │  │
│  │  5   │ ...  │     8     │  3m 02s  │    800     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─ Your Rank ─────────────────────────────────────┐   │
│  │ #12  |  @your_username  |  5 exercises          │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### User Profile Page

**Route**: `/profile/[userId]`

Shows:
- Avatar + username
- Badge (Beginner → Intermediate → Advanced → Expert → Master)
- Stats: Exercises Mastered, Current Streak, Total Points, Longest Streak

---

## Submission & Scoring System

### How Answer Checking Works

```
User submits answer
        │
        ▼
POST /api/check-answer
        │
        ├──▶ Strategy 1: Exact match (case-insensitive)
        │         └── Match? → isCorrect = true
        │
        ├──▶ Strategy 2: Alternative answers list
        │         └── Match any? → isCorrect = true
        │
        └──▶ Strategy 3: Semantic similarity (ML)
                  │
                  ▼
            Transformers.js (MiniLM model)
            Calculate cosine similarity
                  │
                  ▼
            similarity >= threshold (0.75)?
            └── Yes → isCorrect = true
```

### Points System

- **First correct answer**: +100 points (or problem's basePoints)
- **Subsequent correct answers**: 0 points (already completed)
- **Wrong answers**: 0 points

### Submission Flow

```typescript
// What happens when user submits a correct answer:

1. API calculates similarity score
2. If correct:
   - Create submission record
   - Check if first completion
   - If first: award points, update userProgress
   - Update user's totalPoints
   - Update streaks if applicable
```

---

## API Routes Reference

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/webhooks/clerk` | POST | Clerk webhook handler |
| `/api/sync-user` | GET/POST | Check/set user registration |
| `/api/update-username` | POST | Change username |
| `/api/leaderboard` | GET | Get rankings |
| `/api/profile/[userId]` | GET | Get user profile |
| `/api/check-answer` | POST | Evaluate answer |
| `/api/migrate-completions` | POST | Migrate localStorage to DB |

---

## Environment Variables

### Required for Production

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx          # ⚠️ MUST match Clerk dashboard

# Database
DATABASE_URL=postgresql://user:pass@host/db

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home
```

### Setting Up Clerk Webhook (Important!)

1. Go to Clerk Dashboard → Webhooks
2. Create endpoint: `https://your-domain.vercel.app/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy the **Signing Secret**
5. Add to Vercel as `CLERK_WEBHOOK_SECRET`

---

## Common Development Tasks

### Running Locally

```bash
npm run dev          # Start dev server on localhost:3000
```

### Database Commands

```bash
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio (visual DB editor)
npm run db:seed      # Seed problems table
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
```

### Adding a New Challenge

1. Create folder: `src/problems/your-challenge-slug/`
2. Add `info.js`, `Visual.jsx`, `data.json`
3. Register in `src/problems/index.js`
4. Add to `problems` table in database

### Testing Webhooks Locally

Use ngrok to expose localhost:
```bash
ngrok http 3000
# Then update Clerk webhook URL to ngrok URL
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │
│  │   /home     │  │ /leaderboard│  │  /solve/[id]│  │  /profile  │  │
│  │  Dashboard  │  │   Rankings  │  │  Challenges │  │   Stats    │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘  │
└─────────┼────────────────┼────────────────┼───────────────┼─────────┘
          │                │                │               │
          ▼                ▼                ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           API LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  /api/sync-  │  │ /api/leader- │  │ /api/check-  │  ...more      │
│  │    user      │  │    board     │  │   answer     │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
└─────────┼────────────────┼────────────────┼─────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                                │
│         ┌──────────────────────────────────────────┐                │
│         │            Neon PostgreSQL               │                │
│         │  ┌───────┐ ┌─────────┐ ┌────────────┐   │                │
│         │  │ users │ │problems │ │submissions │   │                │
│         │  └───────┘ └─────────┘ └────────────┘   │                │
│         └──────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
          ▲
          │
┌─────────┴───────────────────────────────────────────────────────────┐
│                      CLERK AUTHENTICATION                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     Clerk Dashboard                          │    │
│  │  • User signup/login                                         │    │
│  │  • OAuth providers (Google, GitHub, etc.)                    │    │
│  │  • Webhook → POST /api/webhooks/clerk                        │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference: Where Things Live

| Want to... | Look at... |
|------------|------------|
| Add a new challenge | `src/problems/` + `src/problems/index.js` |
| Change leaderboard logic | `src/db/queries/leaderboard.ts` |
| Modify user registration | `src/app/api/sync-user/route.ts` |
| Update webhook handling | `src/app/api/webhooks/clerk/route.ts` |
| Change username validation | `src/app/api/update-username/route.ts` |
| Modify database schema | `src/db/schema.ts` |
| Change answer evaluation | `src/app/api/check-answer/route.js` |
| Update home dashboard | `src/app/home/page.js` |

---

## Troubleshooting

### "User not found" after signup
- Check if Clerk webhook is configured correctly
- Verify `CLERK_WEBHOOK_SECRET` matches Clerk dashboard
- Check Vercel logs for webhook errors

### Leaderboard not updating
- Verify submissions are being recorded in database
- Check `userProgress` table has `status = 'completed'`
- Verify time filter is correct

### Username changes not working
- Check `/api/update-username` response in network tab
- Verify username passes validation rules
- Check for uniqueness conflicts

---

*Last updated: January 2026*
