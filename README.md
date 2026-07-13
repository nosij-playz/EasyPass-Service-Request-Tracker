# 💎 EasyPass Enterprise: Service Request Tracker

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animations-FF0050?style=for-the-badge)](https://www.framer.com/motion/)

A high-performance, secure enterprise service request management system designed for the UAE's corporate ecosystem. This application implements strict data isolation and a robust synchronization engine to manage government and professional services at scale.

---

## 🚀 Core Enterprise Pillars

### 🛡️ 1. Hardened Data Isolation (RLS)
Security is not an afterthought; it is baked into the database. Using **PostgreSQL Row Level Security (RLS)**, we ensure that data leakage is physically impossible. 
- **Zero-Trust Architecture**: The application layer does not filter data; the database rejects unauthorized queries.
- **Membership-Based Access**: Users only see companies they are explicitly linked to in the `company_members` table.
- **Granular RBAC**: Role-Based Access Control distinguishes between `admin` and `viewer` at the SQL level, preventing unauthorized writes.

### 🔄 2. Idempotent Synchronization Engine
Integration with flaky external ERPs is a common enterprise challenge. This system implements a **Safe-to-Re-run Sync Logic**:
- **Timestamp-Based Updates**: Uses `external_updated_at` to ensure only newer data overrides existing records.
- **Duplicate Elimination**: Enforces `external_id` uniqueness to prevent record duplication during overlapping sync runs.
- **Deterministic State**: Running the sync 1 time or 100 times results in the same consistent database state.

### 🎨 3. "Billion Dollar" User Experience
Beyond functionality, the system delivers a luxury enterprise feel:
- **Glassmorphism 2.0**: Backdrop blurs, semi-transparent borders, and inner glows for a modern SaaS aesthetic.
- **Intelligent Motion**: Framer Motion powered staggered entrances and spring-based micro-interactions.
- **Responsive Fluidity**: A mobile-first approach ensuring seamless management across all device tiers.

---

## 🛠️ Technical Specification

### Tech Stack
- **Framework**: Next.js 14 (App Router, Server Actions)
- **Language**: TypeScript (Strict Mode)
- **Backend-as-a-Service**: Supabase (PostgreSQL, Auth, RLS)
- **Styling**: Tailwind CSS + Custom Design Tokens
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

### Database Architecture
| Table | Purpose | Key Constraints |
| :--- | :--- | :--- |
| `companies` | Core organization data | Primary Key `id` |
| `company_members` | User $\rightarrow$ Company mapping | FK to `auth.users` and `companies` |
| `service_requests` | Request tracking & status | FK to `companies`, Status Enum |
| `invoices` | Synced ERP financial data | Unique `external_id` |

---

## ⚙️ Installation & Setup

### 1. Clone and Initialize
```bash
git clone <your-repo-url>
cd easypass-request-tracker
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local` and configure your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Deployment
Apply the migrations in your Supabase SQL Editor in this specific sequence:
1. `supabase/migrations/01_schema.sql` $\rightarrow$ *Initializes Table Structures*
2. `supabase/migrations/02_rls_policies.sql` $\rightarrow$ *Activates Security Layers*

### 4. Data Seeding
Initialize the environment with a comprehensive test suite:
```bash
npm run seed
```

### 5. Launch
```bash
npm run dev
```
Visit `http://localhost:3000` to experience the platform.

---

## 🧪 Verification & Testing

### RLS Proof-of-Concept
To verify the isolation, we tested the following scenarios:
- **Cross-Tenant Leakage**: Attempted to access a Company ID belonging to User B while logged in as User A. Result: `404 Not Found` (Database filtered the record).
- **Permission Escalation**: Attempted to trigger a status update as a `viewer`. Result: `403 Forbidden` (RLS policy blocked the UPDATE operation).

### Sync Idempotency Test
The sync was executed three times sequentially against the mock ERP payload:
- **Run 1**: 6 Inserts, 2 Updates (Initial load).
- **Run 2**: 0 Inserts, 0 Updates (Stable state).
- **Run 3**: 0 Inserts, 0 Updates (Consistent state).
- **Outcome**: Zero duplicates created; total record count remained constant at 6.

---

## 📑 Project Documentation
For a deep dive into the AI prompts used, detailed RLS verification steps, and the architectural escalation question, please refer to the [NOTES.md](./NOTES.md) file.

---

## 👤 Author
**Jison Joseph Sebastian**  
*AI/ML Engineer & Full-Stack Developer*

[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-blue?style=for-the-badge)](https://www.jisonjosephsebastian.work.gd/)
[![GitHub](https://img.shields.io/badge/GitHub-nosij--playz-black?style=for-the-badge&logo=github)](https://github.com/nosij-playz)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/jison-joseph-sebastian/)
