-- Academic Workload Simulator (App Router) schema for Supabase Postgres.
-- Apply in Supabase SQL editor.

-- 1) Core entities
create table if not exists public.students (
  id uuid primary key, -- matches auth.users.id
  name text not null,
  email text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  week int not null check (week >= 1),
  "order" int not null check ("order" >= 1),
  created_at timestamptz not null default now(),
  unique (course_id, week, "order")
);

create type public.assessment_type as enum ('quiz', 'exam');

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  type public.assessment_type not null,
  title text not null,
  time_limit_seconds int not null default 300 check (time_limit_seconds > 0),
  max_questions int not null default 5 check (max_questions > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  question text not null,
  options jsonb not null, -- array of strings
  correct_answer text not null,
  created_at timestamptz not null default now()
);

-- 2) Attempts & scoring
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  submitted_at timestamptz,
  duration_seconds int,
  question_ids uuid[] not null,
  answers jsonb not null default '{}'::jsonb, -- { [questionId]: chosenOptionText }
  score int,
  is_final boolean not null default false,
  created_at timestamptz not null default now()
);

-- Prevent resubmission abuse: only one final submission per student+assessment.
create unique index if not exists attempts_one_final_per_assessment
  on public.attempts(student_id, assessment_id)
  where is_final = true;

create index if not exists attempts_student_created_at
  on public.attempts(student_id, created_at desc);

-- 3) Exam behavioral sessions
create table if not exists public.exam_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  time_spent_seconds int not null default 0,
  tab_switches int not null default 0,
  focus_losses int not null default 0,
  click_count int not null default 0,
  behavior_state jsonb not null default '{}'::jsonb, -- rolling features
  created_at timestamptz not null default now()
);

-- 4) Derived behavior metrics (intelligence layer)
create table if not exists public.behavior_metrics (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  session_id uuid not null, -- clickstream session id OR exam_sessions.id (app-level)
  metrics jsonb not null,
  created_at timestamptz not null default now()
);

create unique index if not exists behavior_metrics_unique_session
  on public.behavior_metrics(student_id, session_id);

create index if not exists behavior_metrics_student_created_at
  on public.behavior_metrics(student_id, created_at desc);

-- NOTE: Clickstream remains in its own analytics layer (existing tables/functions)
-- e.g. clickstream_data + increment_clickstream RPC.

