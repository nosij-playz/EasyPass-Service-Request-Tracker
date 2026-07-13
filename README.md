# EasyPass Service Request Tracker

A miniature service request tracking system built for the EasyPass founding engineer take-home task. Built with Next.js (App Router), TypeScript, and Supabase.

## Features
- **Authentication**: Email/password sign-in with Supabase Auth
- **Data Isolation**: PostgreSQL RLS ensures users only see their company data
- **Role-based Access**: Admins can create/update requests; Viewers are read-only
- **ERP Sync**: Idempotent invoice sync from a mock flaky ERP (no duplicates, handles updates)

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Supabase (Auth, PostgreSQL, RLS)
- Tailwind CSS (for minimal styling)

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repo-url>
cd easypass-request-tracker