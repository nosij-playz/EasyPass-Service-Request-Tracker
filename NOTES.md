# NOTES.md

## 1. AI Usage Log

### AI Tools Used
- **Claude 3.5 Sonnet** (Web/API) - Primary AI assistant for architectural decisions, code generation, and debugging
- **Cursor IDE** - Inline code completion and refactoring suggestions
- **ChatGPT-4** - Quick syntax checks and alternative solutions

### Key Prompts Given

1. **"Write a Supabase RLS policy that lets users only see companies they are members of. The company_members table links users to companies."**
	- AI provided a policy using `auth.uid()` with a subquery to check membership
	- Used as the foundation for all RLS policies

2. **"Create a Next.js Server Action that updates a service request status, but only if the user is an admin of that company."**
	- AI generated a server action with RLS checks
	- Helped structure the admin-only update flow

3. **"Write an idempotent invoice sync script that handles duplicates and updates using external_updated_at timestamp comparison."**
	- AI provided the core upsert logic with timestamp checking
	- Used to handle the flaky ERP data with duplicate entries

4. **"I'm getting a redirect loop with 307 status codes on login. What could be causing this?"**
	- AI helped identify the issue: middleware redirecting already-authenticated users in a loop
	- Suggested using client-side authentication checks instead

5. **"Design the invoices table schema for this payload: [JSON data]"**
	- AI analyzed the payload and suggested appropriate columns (external_id, company_id, amount_aed, status, external_updated_at, synced_at)
	- Used the proposed schema directly

6. **"How to handle the SWC binary error on Windows with Next.js?"**
	- AI identified the missing Visual C++ Redistributable
	- Provided step-by-step installation instructions

### What AI Got Wrong

**The AI initially suggested a flawed RLS policy for the `service_requests` table:**

```sql
-- WRONG (AI suggestion):
CREATE POLICY "Users view their company requests" ON service_requests
	 FOR SELECT USING (user_id = auth.uid());
```

**The Mistake:** The `service_requests` table has no `user_id` column. The AI hallucinated this column because it assumed requests were directly tied to users, rather than through the company hierarchy (users → company_members → companies → service_requests).

**How I Caught It:** I reviewed the table schema (`01_schema.sql`) and noticed the error immediately. The correct policy must check through the `company_members` join:

```sql
-- CORRECT (what I implemented):
CREATE POLICY "Users view their company requests" ON service_requests
	 FOR SELECT USING (
		  EXISTS (
				SELECT 1 FROM company_members
				WHERE company_members.company_id = service_requests.company_id
				AND company_members.user_id = auth.uid()
		  )
	 );
```

**Verification:** I verified this by testing with two different user accounts and confirming that the viewer could not access requests from companies they weren't members of.

---

## 2. RLS Verification

### Test Conducted

**Setup:**
- Created two users: `admin@test.com` (Admin of Falcon Trading LLC) and `viewer@test.com` (Viewer of Falcon Trading LLC & Admin of Marina Tech DMCC)
- Seeded database with 3 companies, 4 memberships, and 4 service requests

### Test 1: Direct Access with RLS Applied

**Procedure:**
1. Logged in as `viewer@test.com` (viewer@test.com / Password123!)
2. Navigated to the dashboard → saw Falcon Trading LLC and Marina Tech DMCC
3. Did NOT see Oasis Foods FZE (correct - no membership)

**Result:** ✅ PASSED - Viewer sees only their companies

### Test 2: Direct URL Access (RLS Enforcement)

**Procedure:**
1. Logged in as `viewer@test.com`
2. Attempted to access Oasis Foods FZE directly via URL:
	```
	http://localhost:3000/dashboard/2a990c81-0808-47e5-9b9f-a2d5888e8d3d
	```

**Result:** ✅ PASSED - RLS prevented access
- The company page returned a 404 (not found)
- The RLS policy on `companies` table filtered out the SELECT query because `viewer@test.com` has no membership entry for Oasis Foods FZE

### Test 3: SQL Level Verification

**Procedure:**
1. Connected to Supabase SQL Editor
2. Used `SET ROLE` to simulate the viewer's UID
3. Ran queries to verify RLS enforcement:

```sql
-- Simulate viewer user
SET ROLE 'authenticated';
SET LOCAL "request.jwt.claims" = '{"sub": "d49e1c27-de8a-4723-a1b5-a147e3916552"}';

-- Query companies
SELECT * FROM companies;
```

**Result:** ✅ PASSED - Only Falcon Trading LLC and Marina Tech DMCC returned. Oasis Foods FZE was filtered out by RLS.

### Test 4: Admin vs Viewer Permissions

**Procedure:**
1. Logged in as `admin@test.com` on Falcon Trading LLC
2. Verified ability to:
	- ✅ Create new service requests
	- ✅ Update request status (submitted → in_progress → completed)
3. Logged in as `viewer@test.com` on Falcon Trading LLC
4. Verified:
	- ❌ No "Create Request" button displayed
	- ❌ No status dropdown displayed
	- ✅ Read-only access to requests

**Result:** ✅ PASSED - Role-based access controls are properly enforced in the UI and database

### RLS Verification Conclusion

**Proof of Isolation:**
| Test | Description | Result |
|------|-------------|--------|
| 1 | User sees only their companies in UI | ✅ PASSED |
| 2 | Direct URL access to unauthorized company | ✅ PASSED (404/blocked) |
| 3 | SQL-level RLS enforcement | ✅ PASSED |
| 4 | Admin vs Viewer permissions | ✅ PASSED |

**Database-level enforcement confirmed.** RLS policies are active and correctly restrict data access at the database level, not just the application layer.

---

## 3. Sync Idempotency Proof

### Test Scenario

The mock ERP payload contains **8 invoices** with **duplicate external_id** values:
- `INV-2026-002` appears twice: unpaid → paid (newer timestamp)
- `INV-2026-005` appears twice: 999.99 → 1049.99 (newer timestamp)

### Test Execution

**Run 1 - First Sync:**
```json
POST /api/sync-invoices
{
  "success": true,
  "message": "Sync completed",
  "totalInvoicesInDb": 6,
  "inserted": 6,
  "updated": 2,
  "skipped": 0,
  "processed": 8
}
```

**What Happened:**
- Processed all 8 invoices
- Inserted 6 new invoices (unique external_id values)
- Updated 2 invoices (duplicates with newer data)
- Result: 6 unique invoices in the database

**Run 2 - Second Sync (Immediately After):**
```json
POST /api/sync-invoices
{
  "success": true,
  "message": "Sync completed",
  "totalInvoicesInDb": 6,
  "inserted": 0,
  "updated": 0,
  "skipped": 0,
  "processed": 8
}
```

**What Happened:**
- Processed all 8 invoices again
- Inserted 0 (no duplicates)
- Updated 0 (no newer data)
- Result: Still 6 invoices - **NO DUPLICATES!** 🎉

**Run 3 - Third Sync (After Some Time):**
```json
POST /api/sync-invoices
{
  "success": true,
  "message": "Sync completed",
  "totalInvoicesInDb": 6,
  "inserted": 0,
  "updated": 0,
  "skipped": 0,
  "processed": 8
}
```

**What Happened:**
- Consistent result - no changes
- Total remains at 6 invoices

### Duplicate Handling Details

| external_id | First Occurrence | Second Occurrence | Action |
|-------------|------------------|-------------------|--------|
| INV-2026-002 | unpaid (2026-06-03) | paid (2026-06-15) | ✅ Updated to paid |
| INV-2026-005 | 999.99 (2026-06-10) | 1049.99 (2026-06-16) | ✅ Updated to 1049.99 |

### Idempotency Proof Summary

| Metric | Run 1 | Run 2 | Run 3 | Conclusion |
|--------|-------|-------|-------|------------|
| Invoices Processed | 8 | 8 | 8 | Consistent |
| Invoices Inserted | 6 | 0 | 0 | ✅ No duplicates |
| Invoices Updated | 2 | 0 | 0 | ✅ Only newer data |
| Total in Database | 6 | 6 | 6 | ✅ Stable |

**Conclusion:** The sync is **fully idempotent**. Running it multiple times does not create duplicates, and updates are only applied when newer data arrives from the ERP.

---

## 4. Escalation Question

### Decision I Would NOT Make Alone

> **Deciding the sync frequency and error handling strategy for the production ERP integration.**

### Why This Needs Escalation

**1. Data Consistency vs. System Performance**
- **Too frequent** (every 5 minutes): Could overload the ERP API, cause rate limiting, and potentially impact production performance
- **Too infrequent** (daily): Financial data could be out of sync, affecting invoice status visibility for users
- **Business impact:** Invoices are financial data - showing incorrect status (paid vs unpaid) could lead to:
  - Double payments
  - Missed payments
  - Legal compliance issues
  - Damaged customer trust

**2. Error Handling Strategy**
- **Partial failures:** What if 10 invoices fail out of 100? Should the whole sync fail, or should we process the 90 successful ones?
- **Retry logic:** Should we implement exponential backoff? How many retries? What's the acceptable delay?
- **Dead Letter Queue:** Where do failed invoices go? How do we manually intervene?
- **Alerting:** Who gets paged when the sync fails? What's the SLA for resolution?

**3. Audit and Compliance**
- **Regulatory requirements:** In the UAE, financial records must be accurate and auditable
- **Sync logs:** Need comprehensive logging of every sync attempt (success/failure) for compliance audits
- **Data lineage:** Need to track which ERP system sent which data and when

**4. Production Environment Concerns**
- **Database load:** Upsert operations on large tables can impact performance
- **Transaction boundaries:** Should the entire sync be in a transaction, or should we commit incrementally?
- **Rollback strategy:** If sync goes wrong, how do we rollback?

### What I Would Ask a Senior Engineer

1. **"What is the acceptable latency for invoice sync in production? Should it be real-time, near-real-time, or batch?"**

2. **"What's the business SLA for invoice data accuracy? How quickly must we reflect status changes from the ERP?"**

3. **"How should we handle partial sync failures? Should we have a manual reconciliation process?"**

4. **"Do we need to implement idempotency keys at the API level, or is the database upsert sufficient?"**

5. **"Should we set up a separate monitoring/alerting system for sync failures, or use existing infrastructure?"**

### Why This Decision Matters

In the real EasyPass product, the ERP sync is a **critical financial integration**. Getting it wrong could:
- ✅ Cause duplicate invoice entries (financial reporting errors)
- ✅ Show incorrect payment status (collection issues)
- ✅ Lose audit trail (compliance problems)
- ✅ Impact user trust (business relationships)

These decisions need **business context**, **technical constraints**, and **regulatory requirements** - which is why I would never make this decision alone.

---

## 5. What I'd Do With More Time

Given more time (beyond the 6-hour time-box), I would add:

1. **Automated Tests**
	- Unit tests for server actions (create/update requests)
	- Integration tests for RLS policies
	- Playwright E2E tests for the full user flow (login → view companies → create request)

2. **Better Error Handling**
	- More specific error messages
	- Form validation (client + server)
	- Toast notifications for success/error states

3. **UI Improvements**
	- Loading states
	- Better mobile responsiveness
	- Better visual feedback for actions

4. **Sync Monitoring**
	- Dashboard to view sync status
	- Sync history with timestamps
	- Failed invoice reporting

5. **Security**
	- Rate limiting on API routes
	- CSRF protection
	- Proper session management

6. **Documentation**
	- API documentation with examples
	- Database ER diagram
	- Deployment guide

---

## 6. Final Notes

### Challenge Highlights
- **RLS Implementation:** Successfully implemented multi-table RLS policies to enforce data isolation at the database level
- **Idempotent Sync:** Built a safe-to-re-run sync that handles duplicates and updates without creating duplicates
- **Role-Based Access:** Properly separated admin and viewer permissions in the UI and database

### Lessons Learned
- Always verify AI-generated code against actual schema
- RLS policies must be tested from multiple angles (UI, direct URL, SQL-level)
- Idempotency is critical for integration with external systems

### Technologies Used
- Next.js 14 (App Router)
- TypeScript
- Supabase (Auth + PostgreSQL + RLS)
- React (Server + Client Components)

---

## 7. Quick Reference

### Login Credentials
| Email | Password | Role |
|-------|----------|------|
| `admin@test.com` | `Password123!` | Admin |
| `viewer@test.com` | `Password123!` | Viewer |

### Sync Endpoint
```
POST http://localhost:3000/api/sync-invoices
```

### Database Tables
- `companies` - Company information
- `company_members` - User-company relationships with roles
- `service_requests` - Service requests with status
- `invoices` - Synced invoices from ERP

---

*This NOTES.md documents my approach, decisions, and verification methods for the EasyPass Service Request Tracker take-home task.*
