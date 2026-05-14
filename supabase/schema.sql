create extension if not exists pgcrypto;

create table if not exists public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(trim(nome)) >= 3),
  email text,
  telefone text,
  whatsapp text,
  servico text not null check (
    servico in (
      'Corte masculino',
      'Hidratacao',
      'Escova',
      'Coloracao',
      'Diagnostico Foundry',
      'Automacao com Agentes',
      'Integracao Supabase',
      'Mentoria tecnica'
    )
  ),
  data date not null,
  horario time without time zone not null,
  mensagem text,
  observacoes text,
  status text not null default 'pendente' check (
    status in ('pendente', 'confirmado', 'cancelado', 'concluido')
  ),
  origem text not null default 'site',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(trim(coalesce(whatsapp, telefone, ''))) >= 8)
);

alter table public.agendamentos
  add column if not exists email text,
  add column if not exists telefone text,
  add column if not exists whatsapp text,
  add column if not exists mensagem text,
  add column if not exists observacoes text,
  add column if not exists origem text not null default 'site',
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.agendamentos
  alter column email drop not null;

update public.agendamentos
set
  whatsapp = coalesce(whatsapp, telefone),
  observacoes = coalesce(observacoes, mensagem)
where whatsapp is null or observacoes is null;

create index if not exists agendamentos_data_horario_idx
  on public.agendamentos (data, horario);

create index if not exists agendamentos_status_idx
  on public.agendamentos (status);

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
grant usage on schema public to service_role, anon;
grant select, insert, update, delete on public.agendamentos to service_role;
grant insert (
  id,
  nome,
  email,
  telefone,
  whatsapp,
  servico,
  data,
  horario,
  mensagem,
  observacoes,
  origem,
  metadata
) on public.agendamentos to anon;

drop policy if exists agendamentos_insert_anon on public.agendamentos;

create policy agendamentos_insert_anon
  on public.agendamentos
  for insert
  to anon
  with check (
    status = 'pendente'
    and origem = 'site'
    and jsonb_typeof(metadata) = 'object'
    and char_length(trim(coalesce(whatsapp, telefone, ''))) >= 8
  );

comment on table public.agendamentos is
  'Agendamentos do projeto SENAI Agenda IA recebidos por Netlify Functions e usados como case didático do curso MS FOUNDRY 2602.';
