create extension if not exists pgcrypto;

create table if not exists public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(trim(nome)) >= 3),
  email text not null check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  telefone text not null check (char_length(trim(telefone)) >= 8),
  servico text not null check (
    servico in (
      'Diagnostico Foundry',
      'Automacao com Agentes',
      'Integracao Supabase',
      'Mentoria tecnica'
    )
  ),
  data date not null,
  horario time without time zone not null,
  mensagem text,
  status text not null default 'pendente' check (
    status in ('pendente', 'confirmado', 'cancelado', 'concluido')
  ),
  origem text not null default 'site',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
grant usage on schema public to service_role;
grant select, insert, update, delete on public.agendamentos to service_role;

comment on table public.agendamentos is
  'Agendamentos recebidos pela Netlify Function /api/criar-agendamento.';
