-- 2ITeam: схема личного кабинета (profiles, companies, tickets) + RLS
-- Запустить в Supabase: SQL Editor -> New query -> вставить -> Run.

-- =========================================================
-- Таблицы
-- =========================================================

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  inn text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'client' check (role in ('client', 'admin')),
  company_id uuid references public.companies (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity (start with 1001),
  user_id uuid not null references public.profiles (id) on delete cascade,
  company_id uuid references public.companies (id) on delete set null,
  subject text not null,
  description text,
  service text,
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'waiting', 'resolved', 'closed')),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tickets_user_id_idx on public.tickets (user_id);
create index if not exists tickets_status_idx on public.tickets (status);

-- =========================================================
-- Триггеры
-- =========================================================

-- Автосоздание профиля при регистрации
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Обновление updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tickets_set_updated_at on public.tickets;
create trigger tickets_set_updated_at
  before update on public.tickets
  for each row execute function public.set_updated_at();

-- Проверка роли администратора (security definer обходит RLS, без рекурсии)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Запрет менять себе роль (кроме админов)
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_change on public.profiles;
create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- =========================================================
-- RLS
-- =========================================================

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.tickets enable row level security;

-- profiles
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- companies: чтение всем авторизованным, изменение — админ
drop policy if exists companies_select on public.companies;
create policy companies_select on public.companies
  for select using (auth.role() = 'authenticated');

drop policy if exists companies_admin_all on public.companies;
create policy companies_admin_all on public.companies
  for all using (public.is_admin()) with check (public.is_admin());

-- tickets
drop policy if exists tickets_select on public.tickets;
create policy tickets_select on public.tickets
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists tickets_insert on public.tickets;
create policy tickets_insert on public.tickets
  for insert with check (auth.uid() = user_id);

drop policy if exists tickets_update_admin on public.tickets;
create policy tickets_update_admin on public.tickets
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists tickets_delete_admin on public.tickets;
create policy tickets_delete_admin on public.tickets
  for delete using (public.is_admin());

-- =========================================================
-- Права доступа
-- =========================================================

grant usage on schema public to anon, authenticated;
grant all on public.profiles to authenticated;
grant all on public.companies to authenticated;
grant all on public.tickets to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- =========================================================
-- Назначение администратора (выполнить ПОСЛЕ регистрации вашего аккаунта,
-- подставив свой email):
-- =========================================================
-- update public.profiles set role = 'admin' where email = 'support@2iteam.ru';
