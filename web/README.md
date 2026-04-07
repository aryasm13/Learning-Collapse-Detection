## Academic Workload Simulator (Production-style App Router)

This app is a behavior-driven learning simulation platform (not a static LMS demo).
It includes:

- Supabase Auth (email/password)
- Protected routes with cookie-backed session persistence
- Relational simulation model (`students`, `courses`, `modules`, `assessments`, `questions`, `attempts`)
- Behavioral engine (`exam_sessions`, `behavior_metrics`)
- Dynamic dashboards from real student activity

## Environment Variables

Create `web/.env.local` with:

```bash
DATABASE_URL=postgres://...
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## Database Bootstrap

Apply schema to Postgres/Supabase:

```bash
npm run db:bootstrap
```

This executes `supabase/schema.sql`.

Course/assessment seed data is auto-created at runtime when the dashboard layout loads
and `courses` is empty.

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

Full code verification:

```bash
npm run verify
```

Manual smoke test checklist:

1. Sign up with a new email at `/login`
2. Confirm redirect to `/dashboard`
3. Open `/course` and confirm dynamic courses/modules appear
4. Start an assessment at `/assessments`
5. Submit within timer and verify score + attempt history
6. Run `/exam` session, click around, blur tab once, end session
7. Return to `/dashboard` and verify behavior insights update

## Notes

- Deprecated demo endpoints still exist for compatibility but now return `410`.
- If Next warns about multiple lockfiles, keep one canonical lockfile per workspace.
