# Debugging Guide - EasyPass Service Request Tracker

This document provides guidance and common patterns for debugging the EasyPass application.

## Local Environment Debugging

### Next.js Dev Server
- **Logs:** The terminal running `npm run dev` contains server-side logs. Look for "Server" markers to distinguish from "Client" logs.
- **HMR:** Hot Module Replacement should update the browser instantly. If it doesn't, check for syntax errors in the terminal.
- **Network Tab:** Use the Browser DevTools Network tab to inspect API requests to `/api` routes and direct calls to Supabase.

### Client-Side Debugging
- **Console Logs:** Use `console.log()` for quick checks, but remove them before committing.
- **React DevTools:** Use the React DevTools extension to inspect component state and props in real-time.
- **Breakpoints:** Use the `debugger;` statement in your code to trigger the browser's debugger.

## Supabase & Database Troubleshooting

### Authentication Issues
- **Session State:** Check the `localStorage` or Cookies for the Supabase session token.
- **Auth Logs:** Check the Supabase Dashboard → Authentication → Logs for failed login attempts or token errors.
- **RLS Policies:** If data is missing but exists in the DB, it is almost always a Row Level Security (RLS) issue. Verify the user's `auth.uid()` matches the policy requirements.

### Query Debugging
- **SQL Editor:** Test complex queries in the Supabase SQL Editor before implementing them in TypeScript.
- **Error Codes:** Pay attention to PostgreSQL error codes returned by the Supabase client.
- **Real-time:** If subscriptions aren't firing, ensure "Realtime" is enabled for that specific table in the Supabase Dashboard.

## Common Issues & Fixes

### 1. "Hydration failed" Error
- **Cause:** Server-rendered HTML differs from client-rendered HTML (e.g., using `window` or `localStorage` during initial render).
- **Fix:** Wrap client-only logic in `useEffect` or create a `ClientOnly` wrapper component.

### 2. API Route 500 Errors
- **Cause:** Unhandled exceptions in server-side code or database timeouts.
- **Fix:** Check server logs. Wrap database calls in `try...catch` blocks and return meaningful error messages.

### 3. TypeScript Errors in `node_modules`
- **Cause:** Mismatched type definitions or outdated packages.
- **Fix:** Run `npm install` to ensure dependencies are aligned, or check for updated `@types` packages.

## Debugging Workflow
1. **Isolate:** Determine if the issue is Client-side (UI/State) or Server-side (API/DB).
2. **Reproduce:** Create a minimal set of steps to trigger the bug.
3. **Inspect:** Use logs and DevTools to track the data flow.
4. **Fix & Verify:** Apply the fix and verify using the `verify` skill or manual testing.
5. **Prevent:** Add a regression test or update `NOTES.md` if it's a common pitfall.
