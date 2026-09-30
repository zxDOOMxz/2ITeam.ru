-- 2ITeam: схема личного кабинета (profiles, companies, tickets) + RLS
-- Идемпотентно: можно запускать повторно (SQL Editor -> Run).

-- =========================================================
-- Таблицы
-- =========================================================

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  inn text,
  invite_code text unique default upper(substr(md5(random()::text), 1, 8)),
  owner_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Дополняем companies для уже существующих баз
alter table public.companies add column if not exists invite_code text;
alter table public.companies add column if not exists owner_id uuid references auth.users (id) on delete set null;
alter table public.companies alter column invite_code set default upper(substr(md5(random()::text), 1, 8));
update public.companies
  set invite_code = upper(substr(md5(random()::text), 1, 8))
  where invite_code is null;
create unique index if not exists companies_invite_code_key on public.companies (invite_code);

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
create index if not exists tickets_company_id_idx on public.tickets (company_id);

-- Реквизиты для закрывающих документов (актов)
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists inn text;

alter table public.companies add column if not exists legal_name text;
alter table public.companies add column if not exists kpp text;
alter table public.companies add column if not exists ogrn text;
alter table public.companies add column if not exists legal_address text;
alter table public.companies add column if not exists bank_name text;
alter table public.companies add column if not exists bik text;
alter table public.companies add column if not exists account text;
alter table public.companies add column if not exists corr_account text;
alter table public.companies add column if not exists contact_person text;

-- =========================================================
-- Функции
-- =========================================================

-- Автосоздание профиля при регистрации (имя + телефон из метаданных)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at
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

-- Роль администратора
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

-- Компания текущего пользователя
create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

-- Запрет менять себе роль (кроме админов и контекста SQL/сервиса)
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

-- Создать компанию и стать её владельцем
create or replace function public.create_company(p_name text, p_inn text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if coalesce(trim(p_name), '') = '' then
    raise exception 'company name is required';
  end if;
  insert into public.companies (name, inn, owner_id)
  values (trim(p_name), nullif(trim(coalesce(p_inn, '')), ''), auth.uid())
  returning id into cid;
  update public.profiles set company_id = cid where id = auth.uid();
  return cid;
end;
$$;

-- Войти в компанию по коду-приглашению
create or replace function public.join_company(code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  select id into cid from public.companies where invite_code = upper(trim(code));
  if cid is null then
    raise exception 'company not found';
  end if;
  update public.profiles set company_id = cid where id = auth.uid();
  return cid;
end;
$$;

-- Покинуть компанию
create or replace function public.leave_company()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  update public.profiles set company_id = null where id = auth.uid();
end;
$$;

-- Ответ клиента по заявке в статусе "waiting": accept (принять) / rework (на доработку)
create or replace function public.respond_to_ticket(p_ticket_id uuid, p_action text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  t public.tickets;
  allowed boolean;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  select * into t from public.tickets where id = p_ticket_id;
  if t.id is null then
    raise exception 'ticket not found';
  end if;
  allowed := (t.user_id = auth.uid())
    or (t.company_id is not null and t.company_id = public.current_company_id())
    or public.is_admin();
  if not allowed then
    raise exception 'not allowed';
  end if;
  if t.status <> 'waiting' then
    raise exception 'ticket is not awaiting client response';
  end if;
  if p_action = 'accept' then
    update public.tickets set status = 'resolved' where id = p_ticket_id;
  elsif p_action = 'rework' then
    update public.tickets set status = 'in_progress' where id = p_ticket_id;
  else
    raise exception 'unknown action';
  end if;
end;
$$;

-- =========================================================
-- RLS
-- =========================================================

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.tickets enable row level security;

-- profiles: свой профиль, коллеги по компании, админ
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (
    auth.uid() = id
    or public.is_admin()
    or (company_id is not null and company_id = public.current_company_id())
  );

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- companies: своя компания или админ
drop policy if exists companies_select on public.companies;
create policy companies_select on public.companies
  for select using (id = public.current_company_id() or public.is_admin());

drop policy if exists companies_insert on public.companies;
create policy companies_insert on public.companies
  for insert with check (auth.uid() = owner_id);

drop policy if exists companies_update on public.companies;
create policy companies_update on public.companies
  for update using (auth.uid() = owner_id or public.is_admin())
  with check (auth.uid() = owner_id or public.is_admin());

drop policy if exists companies_delete on public.companies;
create policy companies_delete on public.companies
  for delete using (public.is_admin());

drop policy if exists companies_admin_all on public.companies;

-- tickets: свои, заявки своей компании, или админ
drop policy if exists tickets_select on public.tickets;
create policy tickets_select on public.tickets
  for select using (
    auth.uid() = user_id
    or public.is_admin()
    or (company_id is not null and company_id = public.current_company_id())
  );

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
-- Права
-- =========================================================

grant usage on schema public to anon, authenticated;
grant all on public.profiles to authenticated;
grant all on public.companies to authenticated;
grant all on public.tickets to authenticated;
grant usage, select on all sequences in schema public to authenticated;

grant execute on function public.create_company(text, text) to authenticated;
grant execute on function public.join_company(text) to authenticated;
grant execute on function public.leave_company() to authenticated;
grant execute on function public.respond_to_ticket(uuid, text) to authenticated;

-- =========================================================
-- Назначение администратора (после регистрации):
-- =========================================================
-- update public.profiles set role = 'admin' where email = 'support@2iteam.ru';
