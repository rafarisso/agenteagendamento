# SENAI Agenda IA

Laboratório didático de agente de agendamento com Microsoft Foundry e Supabase.

## Informações

- Projeto: SENAI Agenda IA
- Autor: Rafael Risso
- Professor homenageado: Alexandre Becas Hernandes
- Curso: MS FOUNDRY 2602
- Instituição: SENAI
- Data: Maio de 2026
- Deploy: https://agente-agendamento.netlify.app/
- Repositório: https://github.com/rafarisso/COLOQUE-O-NOME-DO-REPOSITORIO-AQUI

## Tese do Projeto

Este projeto demonstra a diferença entre um chatbot comum e um agente conectado a ferramentas reais. O agente entende a solicitação do usuário, consulta disponibilidade, sugere horários, chama uma API e registra o agendamento no Supabase.

Caso de uso demonstrativo: agendamento para salão de beleza. A lógica pode ser adaptada para clínicas, escolas, oficinas, consultorias, laboratórios, atendimento interno e outros serviços.

## Tecnologias

- Microsoft Foundry
- React
- TypeScript
- Vite
- Supabase
- Netlify
- Netlify Functions
- OpenAPI

## Arquitetura

```text
Usuário
  ↓
Chat
  ↓
Agente Microsoft Foundry
  ↓
Ferramenta OpenAPI
  ↓
Netlify Function
  ↓
Supabase
  ↓
Painel Didático
```

## Rotas

- `/` - Home institucional.
- `/chat` - Demonstração principal com chat.
- `/painel` - Painel didático conectado ao Supabase.
- `/documentacao` - Documentação completa do projeto.
- `/sobre` - Informações institucionais e créditos.
- `/simulador-api` - Rota secundária para testar manualmente o endpoint de criação.

## Endpoints

### GET `/api/disponibilidade?data=YYYY-MM-DD`

Lista os horários didáticos de uma data.

### POST `/api/consultar-disponibilidade`

```json
{
  "data": "2026-05-15",
  "servico": "Hidratação",
  "periodo": "tarde"
}
```

### POST `/api/criar-agendamento`

```json
{
  "nome": "Juliana Alves",
  "whatsapp": "11988887777",
  "servico": "Hidratação",
  "data": "2026-05-15",
  "horario": "15:30",
  "observacoes": "Cliente prefere atendimento no período da tarde",
  "origem": "chat"
}
```

Regras aplicadas no servidor:

- Não permite domingo nem segunda.
- Não permite horários fora das janelas didáticas.
- Não permite criar agendamento em horário já ocupado.
- Valida nome, WhatsApp, serviço, data, horário e origem.
- Status inicial: `pendente`.
- Origens aceitas: `chat`, `manual`, `foundry`, `teste`.

## Banco de Dados

Execute `supabase/schema.sql` no SQL Editor do Supabase. A tabela principal é `public.agendamentos`, com RLS habilitado. A service role deve ser usada apenas nas Netlify Functions.

## Variáveis de Ambiente

```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
SUPABASE_PUBLISHABLE_KEY=sua-publishable-key
```

Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend. O arquivo `.env.example` deve conter apenas placeholders.

## Rodar Localmente

```bash
npm install
npm run dev
```

Para validar build:

```bash
npm run build
```

Para testar Netlify Functions localmente:

```bash
npx netlify dev
```

## Microsoft Foundry

Importe o arquivo `openapi.yaml` no Foundry. O agente deve:

1. Conversar naturalmente.
2. Coletar serviço, data e período.
3. Chamar `consultarDisponibilidade`.
4. Sugerir apenas horários retornados pela API.
5. Coletar nome e WhatsApp.
6. Chamar `criarAgendamento` somente após confirmação.
7. Informar que o registro aparecerá no painel didático.

## Prompt Recomendado

```text
Você é o agente do projeto SENAI Agenda IA.
Converse naturalmente com o usuário.
Colete serviço, data e período desejado.
Consulte disponibilidade antes de confirmar qualquer agendamento.
Sugira apenas horários retornados pela API.
Depois que o usuário escolher um horário, colete nome e WhatsApp.
Crie o agendamento somente após confirmação do usuário.
Informe que o registro aparecerá no painel didático conectado ao Supabase.
Não invente disponibilidade.
Não confirme agendamento sem resposta da API.
Não peça nem mencione chaves de API, service role ou variáveis secretas.
```

## Segurança em Produção

- Proteger o painel com autenticação.
- Usar RLS corretamente.
- Não expor service role.
- Validar payload no servidor.
- Usar permissões por usuário.
- Usar domínio privado ou rota protegida para painel.

## Créditos

Projeto desenvolvido por Rafael Risso, com inspiração e orientação do Professor Alexandre Becas Hernandes.

Curso MS FOUNDRY 2602 | SENAI | Maio de 2026
