create extension if not exists pgcrypto;

create table if not exists public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text,
  telefone text,
  whatsapp text not null,
  servico text not null,
  data date not null,
  horario time without time zone not null,
  mensagem text,
  observacoes text,
  status text not null default 'pendente',
  origem text not null default 'chat',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agendamentos
  add column if not exists email text,
  add column if not exists telefone text,
  add column if not exists whatsapp text,
  add column if not exists mensagem text,
  add column if not exists observacoes text,
  add column if not exists origem text not null default 'chat',
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.agendamentos
set
  whatsapp = coalesce(whatsapp, telefone),
  observacoes = coalesce(observacoes, mensagem),
  origem = case
    when origem = 'site' then 'manual'
    when origem in ('chat', 'manual', 'foundry', 'teste') then origem
    else 'manual'
  end,
  status = case
    when status in ('pendente', 'confirmado', 'cancelado') then status
    else 'cancelado'
  end
where whatsapp is null
  or observacoes is null
  or origem not in ('chat', 'manual', 'foundry', 'teste')
  or status not in ('pendente', 'confirmado', 'cancelado');

alter table public.agendamentos
  alter column whatsapp set not null,
  alter column origem set default 'chat',
  alter column status set default 'pendente';

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.agendamentos'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%status%'
  loop
    execute format('alter table public.agendamentos drop constraint if exists %I', constraint_name);
  end loop;
end $$;

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.agendamentos'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%origem%'
  loop
    execute format('alter table public.agendamentos drop constraint if exists %I', constraint_name);
  end loop;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'agendamentos_status_check'
  ) then
    alter table public.agendamentos
      add constraint agendamentos_status_check
      check (status in ('pendente', 'confirmado', 'cancelado'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'agendamentos_origem_check'
  ) then
    alter table public.agendamentos
      add constraint agendamentos_origem_check
      check (origem in ('chat', 'manual', 'foundry', 'teste'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'agendamentos_whatsapp_check'
  ) then
    alter table public.agendamentos
      add constraint agendamentos_whatsapp_check
      check (char_length(trim(whatsapp)) >= 8);
  end if;
end $$;

create index if not exists agendamentos_data_idx
  on public.agendamentos (data);

create index if not exists agendamentos_horario_idx
  on public.agendamentos (horario);

create index if not exists agendamentos_status_idx
  on public.agendamentos (status);

create index if not exists agendamentos_origem_idx
  on public.agendamentos (origem);

create unique index if not exists agendamentos_slot_ativo_unique
  on public.agendamentos (data, horario)
  where status in ('pendente', 'confirmado');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists agendamentos_set_updated_at on public.agendamentos;

create trigger agendamentos_set_updated_at
before update on public.agendamentos
for each row
execute function public.set_updated_at();

alter table public.agendamentos enable row level security;

revoke all on public.agendamentos from anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, update, delete on public.agendamentos to service_role;

drop policy if exists agendamentos_insert_anon on public.agendamentos;

comment on table public.agendamentos is
  'Agendamentos do projeto SENAI Agenda IA recebidos por Netlify Functions e usados como case didático do curso MS FOUNDRY 2602.';
