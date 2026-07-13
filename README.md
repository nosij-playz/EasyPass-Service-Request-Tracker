```markdown
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

## Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier)

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repo-url>
cd easypass-request-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
cp .env.example .env.local
```

You need:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for seeding and sync)

### 4. Apply database migrations
Run the SQL files in `supabase/migrations/` in your Supabase SQL Editor in this order:

1. `01_schema.sql` - Creates all tables
2. `02_rls_policies.sql` - Sets up Row Level Security policies

### 5. Seed the database
```bash
npm run seed
```

This creates:
- 3 companies (Falcon Trading LLC, Oasis Foods FZE, Marina Tech DMCC)
- 2 users (`admin@test.com` / `viewer@test.com`)
- Memberships with proper roles
- Sample service requests

### 6. Run the development server
```bash
npm run dev
```

Open http://localhost:3000 to see the app.

### 7. Test the ERP Sync (optional)
Trigger the invoice sync endpoint:
```bash
# Using PowerShell
Invoke-RestMethod -Method POST -Uri http://localhost:3000/api/sync-invoices

# Using curl
curl -X POST http://localhost:3000/api/sync-invoices
```

## Test Accounts

| Email | Password | Role |
|-------|----------|------|
| `admin@test.com` | `Password123!` | Admin |
| `viewer@test.com` | `Password123!` | Viewer |

### Admin Access
- Create new service requests
- Update request status (submitted → in_progress → completed)
- View all requests for their companies

### Viewer Access
- Read-only access to service requests
- Cannot create or update requests

## Testing RLS Isolation

1. Log in as `admin@test.com`
2. You should see Falcon Trading LLC and Oasis Foods FZE
3. Log in as `viewer@test.com`
4. You should see Falcon Trading LLC and Marina Tech DMCC
5. Try to access Oasis Foods FZE directly via URL - you'll get a 404

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/                # API routes (mock ERP, sync)
│   │   ├── mock-erp/       # Mock ERP invoice data
│   │   └── sync-invoices/  # Invoice sync endpoint
│   ├── dashboard/          # Protected pages
│   │   ├── page.tsx        # Company list
│   │   └── [companyId]/    # Company-specific requests
│   ├── login/              # Authentication page
│   ├── actions.ts          # Server actions
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Redirect to login/dashboard
├── lib/
│   └── supabase/           # Supabase clients
│       ├── client.ts       # Browser client
│       ├── server.ts       # Server client
│       └── admin.ts        # Admin client (bypasses RLS)
├── scripts/
│   └── seed.ts             # Database seeding script
├── supabase/
│   └── migrations/         # SQL migrations
│       ├── 01_schema.sql
│       ├── 02_rls_policies.sql
│       └── 03_seed_data.sql
├── .env.example            # Environment variables template
├── package.json
├── README.md
└── NOTES.md                # Detailed AI usage, RLS verification, sync proof
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key (client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |

## Database Schema

### Companies
- `id` (UUID, Primary Key)
- `name` (TEXT)
- `created_at` (TIMESTAMPTZ)

### Company Members
- `id` (UUID, Primary Key)
- `user_id` (UUID, References auth.users)
- `company_id` (UUID, References companies)
- `role` (TEXT: 'admin' or 'viewer')
- `created_at` (TIMESTAMPTZ)

### Service Requests
- `id` (UUID, Primary Key)
- `company_id` (UUID, References companies)
- `title` (TEXT)
- `status` (TEXT: 'submitted', 'in_progress', 'completed')
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### Invoices
- `id` (UUID, Primary Key)
- `external_id` (TEXT, UNIQUE)
- `company_id` (UUID, References companies)
- `amount_aed` (DECIMAL)
- `status` (TEXT: 'paid' or 'unpaid')
- `external_updated_at` (TIMESTAMPTZ)
- `synced_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

## RLS Policies

- **Companies**: Users can only see companies they're members of
- **Company Members**: Users can only see their own memberships
- **Service Requests**: 
  - SELECT: Users can only see requests from their companies
  - INSERT: Only admins can create
  - UPDATE: Only admins can update status
- **Invoices**: Users can only see invoices from their companies

## ERP Sync

The sync endpoint `/api/sync-invoices`:
- Fetches mock invoice data from `/api/mock-erp/invoices`
- Matches invoices to companies by name
- Inserts new invoices or updates existing ones
- Uses `external_updated_at` to determine if data is newer
- Safe to re-run - no duplicates created

### Mock ERP Data
The mock ERP contains 8 invoices with duplicates:
- `INV-2026-002` appears twice (unpaid → paid)
- `INV-2026-005` appears twice (999.99 → 1049.99)

Running the sync once inserts 6 unique invoices. Running it again:
- No duplicates created
- Invoices with newer data are updated

## Troubleshooting

### Module Not Found: @/lib/supabase/server
Make sure `tsconfig.json` has the path alias:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### RLS Policy Violation
Ensure you've run `02_rls_policies.sql` in the Supabase SQL Editor.

### Seed Fails
Make sure you've applied the migrations first, then run `npm run seed`.

### Login Redirect Loop
Clear browser cookies or use incognito mode.

## Additional Resources

- [NOTES.md](./NOTES.md) - AI usage log, RLS verification, sync idempotency proof
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)

## Author

**Jison Joseph Sebastian**  
AI/ML Engineer & Full-Stack Developer  
- Portfolio: https://www.jisonjosephsebastian.work.gd/  
- Contact: https://www.jisonjosephsebastian.work.gd/contact  
- Email: jisonjosephsebastian7007@gmail.com  
- GitHub: [nosij-playz](https://github.com/nosij-playz)
```