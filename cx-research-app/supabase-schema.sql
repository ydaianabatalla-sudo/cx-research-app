-- ============================================================================
-- CX Research App — Supabase Schema (idempotente, safe para re-correr)
-- Pegá todo este archivo en el SQL Editor de Supabase y ejecutá.
-- ============================================================================

-- Profiles table (extiende auth.users con metadata)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz default now()
);

-- Surveys
create table if not exists public.surveys (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  share_id text unique not null,
  name text not null,
  type text not null check (type in ('NPS', 'CSAT', 'CES')),
  industry text,
  question text not null,
  open_question text,
  segments jsonb default '[]'::jsonb,
  products jsonb default '[]'::jsonb,
  channels jsonb default '[]'::jsonb,
  status text default 'active' check (status in ('active', 'paused', 'closed')),
  created_at timestamptz default now()
);

create index if not exists surveys_owner_idx on public.surveys(owner_id);
create index if not exists surveys_share_idx on public.surveys(share_id);

-- Responses
create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  score integer not null,
  comment text,
  segment text,
  product text,
  channel text,
  respondent_email text,
  created_at timestamptz default now()
);

create index if not exists responses_survey_idx on public.responses(survey_id);
create index if not exists responses_date_idx on public.responses(survey_id, created_at);

-- Closing the loop actions
create table if not exists public.loop_actions (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.responses(id) on delete cascade,
  priority text not null check (priority in ('high', 'med', 'low')),
  status text default 'pending' check (status in ('pending', 'in_progress', 'done', 'skipped')),
  owner text,
  action_taken text,
  notes text,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists loop_actions_response_idx on public.loop_actions(response_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.surveys enable row level security;
alter table public.responses enable row level security;
alter table public.loop_actions enable row level security;

-- Profiles: cada usuario ve y edita el suyo
drop policy if exists "Profiles are viewable by self" on public.profiles;
create policy "Profiles are viewable by self"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Profiles are insertable by self" on public.profiles;
create policy "Profiles are insertable by self"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Profiles are updatable by self" on public.profiles;
create policy "Profiles are updatable by self"
  on public.profiles for update using (auth.uid() = id);

-- Surveys: owner control + lectura pública por share_id
drop policy if exists "Surveys are viewable by owner" on public.surveys;
create policy "Surveys are viewable by owner"
  on public.surveys for select using (auth.uid() = owner_id);

drop policy if exists "Surveys are viewable publicly by share_id" on public.surveys;
create policy "Surveys are viewable publicly by share_id"
  on public.surveys for select using (true);

drop policy if exists "Surveys are insertable by authenticated users" on public.surveys;
create policy "Surveys are insertable by authenticated users"
  on public.surveys for insert with check (auth.uid() = owner_id);

drop policy if exists "Surveys are updatable by owner" on public.surveys;
create policy "Surveys are updatable by owner"
  on public.surveys for update using (auth.uid() = owner_id);

drop policy if exists "Surveys are deletable by owner" on public.surveys;
create policy "Surveys are deletable by owner"
  on public.surveys for delete using (auth.uid() = owner_id);

-- Responses: cualquiera puede insertar (public form); solo owner del survey las puede leer
drop policy if exists "Responses are insertable by anyone" on public.responses;
create policy "Responses are insertable by anyone"
  on public.responses for insert with check (true);

drop policy if exists "Responses are viewable by survey owner" on public.responses;
create policy "Responses are viewable by survey owner"
  on public.responses for select using (
    exists (select 1 from public.surveys s where s.id = survey_id and s.owner_id = auth.uid())
  );

-- Loop actions: solo owner del survey
drop policy if exists "Loop actions viewable by survey owner" on public.loop_actions;
create policy "Loop actions viewable by survey owner"
  on public.loop_actions for select using (
    exists (
      select 1 from public.responses r
      join public.surveys s on s.id = r.survey_id
      where r.id = response_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "Loop actions insertable by survey owner" on public.loop_actions;
create policy "Loop actions insertable by survey owner"
  on public.loop_actions for insert with check (
    exists (
      select 1 from public.responses r
      join public.surveys s on s.id = r.survey_id
      where r.id = response_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "Loop actions updatable by survey owner" on public.loop_actions;
create policy "Loop actions updatable by survey owner"
  on public.loop_actions for update using (
    exists (
      select 1 from public.responses r
      join public.surveys s on s.id = r.survey_id
      where r.id = response_id and s.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- Trigger para crear profile automáticamente al registrarse
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
