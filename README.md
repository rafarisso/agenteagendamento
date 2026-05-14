# Agendamento Foundry

Aplicacao de portifolio para criar agendamentos com front-end React, Netlify
Functions, Supabase e especificacao OpenAPI pronta para uso como ferramenta no
Microsoft Foundry.

## Visao geral

- Interface responsiva para registrar pedidos de consultoria.
- Endpoint publico `/api/criar-agendamento` roteado por redirect para Netlify Function.
- Persistencia no Supabase usando `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor.
- `schema.sql` com tabela, checks, indices, trigger de `updated_at` e RLS habilitado.
- `openapi.yaml` com `operationId`, schemas simples e contrato compativel com Foundry.

## Stack

- React 18 + TypeScript + Vite
- Netlify Functions
- Supabase JavaScript Client
- OpenAPI 3.0.1
- Lucide React

## Estrutura

```text
.
|-- netlify/
|   `-- functions/
|       `-- criar-agendamento.ts
|-- src/
|   |-- lib/api.ts
|   |-- App.tsx
|   |-- main.tsx
|   |-- styles.css
|   `-- types.ts
|-- supabase/schema.sql
|-- openapi.yaml
|-- netlify.toml
|-- .env.example
`-- README.md
```

## Rodando localmente

```bash
npm install
npm run dev
```

Para testar a Function com redirects locais, use Netlify Dev:

```bash
npx netlify dev
```

## Variaveis de ambiente

Configure na Netlify, em **Site configuration > Environment variables**:

```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

Nunca coloque `SUPABASE_SERVICE_ROLE_KEY` no front-end, nem com prefixos como
`VITE_`, `NEXT_PUBLIC_` ou `PUBLIC_`.

## Configurando Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Execute o arquivo `supabase/schema.sql`.
4. Confirme que a tabela `public.agendamentos` foi criada.
5. Mantenha RLS habilitado e use a service role somente pela Netlify Function.

## Deploy na Netlify

1. Conecte o repositorio na Netlify.
2. Use `npm run build` como build command.
3. Use `dist` como publish directory.
4. Configure as variaveis `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
5. Faca o deploy e teste:

```bash
curl -X POST https://SEU-SITE.netlify.app/api/criar-agendamento \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"Rafael Risso\",\"email\":\"contato@example.com\",\"telefone\":\"11999999999\",\"servico\":\"Diagnostico Foundry\",\"data\":\"2026-05-20\",\"horario\":\"09:00\"}"
```

## Microsoft Foundry

Importe `openapi.yaml` como ferramenta do agente e substitua o servidor:

```yaml
servers:
  - url: https://SEU-SITE.netlify.app
```

O contrato usa OpenAPI 3.0.1, `operationId` estavel e schemas sem composicoes
complexas para facilitar a ingestao pelo Foundry.

## Checklist de seguranca

- A service role aparece apenas em `.env.example`, README e Function server-side.
- O front-end chama somente `/api/criar-agendamento`.
- `netlify.toml` coloca o redirect da API antes do fallback SPA.
- RLS esta habilitado no schema Supabase.

## Assinatura

Desenvolvido por Rafael Risso | Curso de Microsoft Foundry | Maio 2026
