-- ==============================================================================
-- FINORA AI — Supabase Database Migration & Row Level Security Schema
-- ==============================================================================
-- Instructions:
-- 1. Log in to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your Finora project (or create a new project).
-- 3. Click on the "SQL Editor" in the left navigation sidebar.
-- 4. Click "New Query", paste this entire script, and click "Run".
-- ==============================================================================

-- Enable UUID extension if not already active
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Create the `transactions` table
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  amount numeric(14, 2) not null check (amount > 0),
  type text not null check (type in ('income', 'expense')),
  category text not null check (char_length(trim(category)) > 0),
  transaction_date date not null default current_date,
  payment_method text not null check (char_length(trim(payment_method)) > 0),
  description text,
  ai_categorized boolean default false,
  status text default 'completed' check (status in ('completed', 'pending', 'flagged')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Performance indexes for transactions
create index if not exists idx_transactions_user_id 
  on public.transactions(user_id);
create index if not exists idx_transactions_date 
  on public.transactions(transaction_date desc);
create index if not exists idx_transactions_user_date 
  on public.transactions(user_id, transaction_date desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Create the `budgets` table
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'), -- e.g. '2026-11'
  overall_limit numeric(14, 2) not null check (overall_limit > 0),
  category_budgets jsonb not null default '{}'::jsonb, -- e.g. {"Food": 15000, "Housing": 40000}
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_budgets_user_month unique (user_id, month)
);

-- Performance indexes for budgets
create index if not exists idx_budgets_user_id on public.budgets(user_id);
create index if not exists idx_budgets_user_month on public.budgets(user_id, month);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Create the `savings_goals` table
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  target_amount numeric(14, 2) not null check (target_amount > 0),
  current_amount numeric(14, 2) not null default 0 check (current_amount >= 0),
  target_date date not null,
  category text default 'Wealth Creation',
  color text default '#1D4938',
  icon text default 'Target',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Performance index for savings_goals
create index if not exists idx_savings_goals_user_id on public.savings_goals(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Shared `updated_at` trigger function
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for transactions
drop trigger if exists trigger_transactions_updated_at on public.transactions;
create trigger trigger_transactions_updated_at
  before update on public.transactions
  for each row execute function public.handle_updated_at();

-- Trigger for budgets
drop trigger if exists trigger_budgets_updated_at on public.budgets;
create trigger trigger_budgets_updated_at
  before update on public.budgets
  for each row execute function public.handle_updated_at();

-- Trigger for savings_goals
drop trigger if exists trigger_savings_goals_updated_at on public.savings_goals;
create trigger trigger_savings_goals_updated_at
  before update on public.savings_goals
  for each row execute function public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Enable Row Level Security (RLS) on all tables
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. RLS Policies for `transactions`
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "Users can view their own transactions" on public.transactions;
drop policy if exists "Users can create transactions for themselves" on public.transactions;
drop policy if exists "Users can update their own transactions" on public.transactions;
drop policy if exists "Users can delete their own transactions" on public.transactions;

create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can create transactions for themselves"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. RLS Policies for `budgets`
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "Users can view their own budgets" on public.budgets;
drop policy if exists "Users can create budgets for themselves" on public.budgets;
drop policy if exists "Users can update their own budgets" on public.budgets;
drop policy if exists "Users can delete their own budgets" on public.budgets;

create policy "Users can view their own budgets"
  on public.budgets for select
  using (auth.uid() = user_id);

create policy "Users can create budgets for themselves"
  on public.budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own budgets"
  on public.budgets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own budgets"
  on public.budgets for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. RLS Policies for `savings_goals`
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "Users can view their own savings goals" on public.savings_goals;
drop policy if exists "Users can create savings goals for themselves" on public.savings_goals;
drop policy if exists "Users can update their own savings goals" on public.savings_goals;
drop policy if exists "Users can delete their own savings goals" on public.savings_goals;

create policy "Users can view their own savings goals"
  on public.savings_goals for select
  using (auth.uid() = user_id);

create policy "Users can create savings goals for themselves"
  on public.savings_goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own savings goals"
  on public.savings_goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own savings goals"
  on public.savings_goals for delete
  using (auth.uid() = user_id);

-- ==============================================================================
-- Schema setup complete. RLS is active and enforced on all 3 tables.
-- ==============================================================================
