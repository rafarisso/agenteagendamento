-- Patch incremental para projetos que foram criados antes da inclusao de novos servicos.
-- Execute no SQL Editor do Supabase se a API retornar erro ao salvar um servico novo,
-- como Depilacao. A validacao de servicos fica centralizada nas Netlify Functions.

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.agendamentos'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%servico%'
  loop
    execute format('alter table public.agendamentos drop constraint if exists %I', constraint_name);
  end loop;
end $$;
