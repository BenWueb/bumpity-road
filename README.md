# Bumpity Road

A cabin management app for tracking activities, memories, and logistics at the family cabin on Woman Lake, MN.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Runtime**: React 19
- **Database**: MongoDB via Prisma ORM
- **Auth**: better-auth (Google, Apple, Facebook, Twitter)
- **Images**: Cloudinary (next-cloudinary, upload preset `bumpity-road`)
- **Styling**: Tailwind CSS v4 + custom UI components (no shadcn/ui)
- **Icons**: lucide-react
- **Maps**: Leaflet / react-leaflet (loon observations)
- **Testing**: Jest + React Testing Library

## Features

| Feature | Auth Required | Description |
|---------|--------------|-------------|
| **Home** | No | Calendar, weather, todo summary, quick links |
| **Guestbook** | No | Token-based entries — anyone can sign, owners can edit/delete |
| **Puzzles** | No | Track completed puzzles with photos and participants |
| **Blog** | Yes | Blog posts with Cloudinary images |
| **Gallery** | Yes | Photo gallery with seasons/activities, lightbox viewer |
| **Adventures** | Yes | Adventure locations with map, categories, and seasons |
| **Loon Watch** | Yes | Loon observation tracking with map, weather, and nesting data |
| **Todos** | Yes | Kanban task board with recurring tasks and assignments |
| **Expenses** | Admin | Expense tracking with voting and comments |
| **Feedback** | Yes | Bug reports and feature requests |
| **Account** | Yes | Profile, badges, activity overview |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- Cloudinary account

### Environment Variables

```env
DATABASE_URL=mongodb+srv://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
APPLE_CLIENT_ID=...
APPLE_CLIENT_SECRET=...
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...
TWITTER_CLIENT_ID=...
TWITTER_CLIENT_SECRET=...

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

GOOGLE_CALENDAR_CLIENT_EMAIL=...
GOOGLE_CALENDAR_PRIVATE_KEY=...
GOOGLE_CALENDAR_ID=...

NEXT_PUBLIC_GA_ID=...
```

### Development

```bash
npm install
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Prisma Commands

Always stop the dev server before running Prisma commands on Windows:

```bash
npx prisma generate    # After schema changes
npx prisma db push     # Push schema to database
```

### Seed Scripts

```bash
npx tsx scripts/seed-expenses.ts
npx tsx scripts/seed-loons.ts
npx tsx scripts/seed-puzzles.ts
```

## Project Structure

```
src/
├── app/                    # Pages and API routes
│   ├── api/                # REST API endpoints
│   └── [feature]/          # Feature pages
├── components/             # Feature-grouped components
│   ├── ui/                 # Reusable UI primitives
│   ├── account/            # Account page cards
│   ├── blog/               # Blog components
│   ├── expenses/           # Expense components
│   ├── gallery/            # Gallery components
│   ├── guestbook/          # Guestbook components
│   ├── loons/              # Loon observation components
│   ├── puzzles/            # Puzzle components
│   └── todos/              # Todo/Kanban components
├── hooks/                  # Client-side state hooks
├── lib/                    # Server utils, constants, helpers
├── types/                  # TypeScript type definitions
└── utils/                  # Prisma, auth, cloudinary, badges
```

## Google Calendar

The Calendar card fetches events from Google Calendar via a service account. See `docs/google-calendar.md` for setup.
