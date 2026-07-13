# Agentic Workflow Guidelines - EasyPass

This document defines how AI agents should collaborate and execute tasks within the EasyPass Service Request Tracker project.

## Agent Roles & Usage

### 1. Exploration (`Explore` Agent)
- **Purpose:** Broad discovery and codebase mapping.
- **When to use:** When the exact location of a feature or bug is unknown, or when understanding how a specific data flow works across multiple files.
- **Expected Outcome:** A high-level map of relevant files and logic paths, not an audit.

### 2. Planning (`Plan` Agent)
- **Purpose:** Architectural design and step-by-step implementation strategy.
- **When to use:** Before any non-trivial code change (new features, refactors, complex bug fixes).
- **Required Output:** A detailed plan that identifies all affected files, proposed changes, and potential trade-offs.

### 3. Implementation (General Purpose / Main Agent)
- **Purpose:** Executing the approved plan.
- **Workflow:** 
  - Implement one task at a time.
  - Verify changes using the `verify` skill or by running the app.
  - Commit changes with descriptive messages.

### 4. Orchestration (`Workflow` Tool)
- **Purpose:** Handling scale and verification (multi-agent).
- **Patterns:**
  - **Understand → Design → Implement → Review**: A full cycle for major features.
  - **Adversarial Verification**: Using multiple agents to try and refute a fix before it is marked as complete.

## Communication Protocols
- **Context Sharing:** Agents should reference specific files using `path:line` format.
- **Hand-offs:** When transitioning from `Plan` to `Implement`, the implementation agent must start by reviewing the plan.
- **Verification:** No task is "completed" until a verification step (test run or manual check) has been performed and documented.

## Quality Gates
- **Type Safety:** All new code must pass TypeScript compilation without errors.
- **Styling:** New UI components must strictly adhere to the project's Tailwind CSS patterns.
- **Supabase:** Database schema changes must be documented and handled via migrations in the `supabase/` directory.
