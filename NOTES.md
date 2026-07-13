# 📝 Engineering & AI Implementation Log
	
This document serves as the technical retrospective and verification record for the EasyPass Service Request Tracker. It documents the synergy between human engineering and AI assistance, proving the system's security and reliability.

---

## 🤖 1. AI Orchestration Log

### 🛠️ Toolset Used
- **DeepSeek-V4 preview** $\rightarrow$ Advanced logic and architectural insights.
- **ChatGPT-4** $\rightarrow$ Quick syntax validation and edge-case brainstorming.
- **Gemma 4 with Claude Code** $\rightarrow$ Primary agentic orchestration, implementation, and codebase management.

### 💡 Strategic Prompting
I utilized a multi-stage prompting strategy to ensure the system wasn't just "generated" but "engineered."

**Example 1: The Security Layer (RLS)**
> *"Write a Supabase RLS policy that lets users only see companies they are members of. The company_members table links users to companies. Ensure the query is optimized for PostgreSQL."*
- **Outcome**: Established the core data isolation layer.

**Example 2: The Sync Logic (Idempotency)**
> *"Write an idempotent invoice sync script that handles duplicates and updates using external_updated_at timestamp comparison. The source is a flaky ERP that may send the same record multiple times with different statuses."*
- **Outcome**: Created the robust synchronization engine.

**Example 3: The UI Transformation**
> *"Transform this service request management application into a billion-dollar enterprise product. Use glassmorphism, blue-indigo-purple gradients, and Framer Motion for micro-interactions. Every interaction must feel luxurious and professional."*
- **Outcome**: Shifted the app from a basic tool to a premium enterprise platform.

### ⚠️ The "AI Hallucination" Catch
AI is a powerful co-pilot, but human oversight is the final gate.

**The Error**: While designing the `service_requests` RLS policy, the AI suggested:
```sql
CREATE POLICY "Users view their company requests" ON service_requests
FOR SELECT USING (user_id = auth.uid());
```
**The Catch**: I immediately identified that the `service_requests` table **has no `user_id` column**. The AI hallucinated a direct user-to-request relationship. In this system, the relationship is indirect: `User` $\rightarrow$ `CompanyMember` $\rightarrow$ `Company` $\rightarrow$ `ServiceRequest`.

**The Correction**: I manually redesigned the policy to use a subquery that validates membership through the join table:
```sql
CREATE POLICY "Users view their company requests" ON service_requests
FOR SELECT UNSIGNED (
    EXISTS (
        SELECT 1 FROM company_members
        WHERE company_members.company_id = service_requests.company_id
        AND company_members.user_id = auth.uid()
    )
);
```

---

## 🛡️ 2. RLS Verification (Proof of Isolation)

To prove the system is secure at the database level, I conducted the following adversarial tests.

### Test Suite: Data Leakage Prevention

| Scenario | Action | Expected Result | Actual Result | Verdict |
| :--- | :--- | :--- | :--- | :---: |
| **Cross-Tenant Access** | Logged in as User A $\rightarrow$ Try to access Company B via direct URL | `404 Not Found` (RLS filter) | `404 Not Found` | ✅ |
| **Permission Escalation** | Logged in as `viewer` $\rightarrow$ Try to `UPDATE` status via API | `403 Forbidden` / No change | No change | ✅ |
| **SQL-Level Bypass** | Set role to `authenticated` $\rightarrow$ Query `companies` table | Return only matched memberships | Only 2/3 companies returned | ✅ |

**Conclusion**: Data isolation is enforced by the PostgreSQL engine. Even if the frontend is bypassed, the database refuses to serve unauthorized data.

---

## 🔄 3. Sync Idempotency Proof

The mock ERP is designed to be "flaky," providing duplicate `external_id` values with updated timestamps.

### Execution Log
| Run | Input Records | Inserted | Updated | Total in DB | Result |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | 8 | 6 | 2 | 6 | Initial Load |
| **2** | 8 | 0 | 0 | 6 | Stable (No duplicates) |
| **3** | 8 | 0 | 0 | 6 | Consistent |

**The Logic**: The system performs a "Look-before-leap" check. If an `external_id` exists, it compares `external_updated_at`. It only triggers an `UPDATE` if the incoming timestamp is strictly greater than the stored one.

---

## 🚩 4. Architectural Escalation

### Decision: Sync Frequency & Error Handling
If this were a production financial system, I would **NOT** implement the current sync strategy alone. I would escalate the following to a Senior Engineer:

**The Challenge**: The "Slam-and-Sync" approach (processing all records in a loop) works for 8 invoices, but fails at 80,000.

**Key Escalation Points**:
1. **Partial Failure Strategy**: If the 50th invoice in a batch of 1,000 fails, do we rollback the entire transaction (Atomic) or commit the 49 successful ones (Eventual Consistency)?
2. **Rate Limiting**: The ERP API likely has thresholds. We need a queue-based system (e.g., BullMQ or Temporal) with exponential backoff.
3. **Audit Trails**: Financial data requires a "Change Log." I would propose a `sync_history` table to track every single change made to an invoice for regulatory compliance.
4. **Dead Letter Queues (DLQ)**: Records that fail validation must be moved to a DLQ for manual review by a financial analyst, rather than just being `console.warn`'d.

---

## 🏁 Final Project Summary

- **Core App**: Fully functional with strict RBAC and RLS.
- **ERP Sync**: Robust, idempotent, and safe to re-run.
- **UX**: Transformed into a luxury enterprise experience.
- **Documentation**: Full traceability from prompts to verification.

**Author**: Jison Joseph Sebastian  
**Role**: AI/ML Engineer & Full-Stack Developer
