# EasyPass Service Request Tracker - Project Guide

## Project Overview
EasyPass is a service request tracking system designed to manage and streamline service requests. 

### Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend/Database:** Supabase
- **Deployment:** Vercel (assumed)

## Development Commands
- **Install dependencies:** `npm install`
- **Run development server:** `npm run dev`
- **Build project:** `npm run build`
- **Lint project:** `npm run lint`

## Code Style & Patterns
- **TypeScript:** Strict typing is preferred. Avoid `any`.
- **Components:** Use functional components with Tailwind CSS for styling.
- **State Management:** Use React hooks (useState, useEffect) and potentially Supabase's real-time subscriptions for live updates.
- **Directory Structure:**
  - `app/`: Page routes and layouts.
  - `components/`: Reusable UI components.
  - `lib/`: Shared utilities and Supabase client.
  - `supabase/`: Database migrations and configuration.

## Guidelines for Claude
- Always check `README.md` and `NOTES.md` for project context before starting.
- Match existing naming conventions and indentation.
- When adding new features, ensure they follow the existing architecture (App Router, Supabase integration).
- Prefer modularity: break large components into smaller, focused ones in `components/`.
