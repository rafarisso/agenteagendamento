# SENAI Agenda IA

Projeto didático de agente de agendamento conectado ao Microsoft Foundry, Supabase e Netlify.

## Informações

- Autor: Rafael Risso
- Professor: Alexandre Becas Hernandes
- Curso: MS FOUNDRY 2602
- Instituição: SENAI
- Data: Maio de 2026
- Deploy: https://agente-agendamento.netlify.app/
- GitHub: https://github.com/rafarisso/agenteagendamento

## Objetivo do Projeto

O SENAI Agenda IA demonstra como um agente criado no Microsoft Foundry pode ir além da conversa. O agente coleta dados do usuário, consulta disponibilidade, chama uma API serverless hospedada na Netlify e registra informações reais no Supabase.

O caso de uso demonstrativo é um agendamento para salão de beleza, mas a arquitetura pode ser aplicada em escolas, clínicas, consultorias, oficinas, restaurantes, setores administrativos e atendimento interno de empresas.

## Tecnologias Utilizadas

- Microsoft Foundry
- React
- TypeScript
- Vite
- Supabase
- Netlify
- Netlify Functions
- OpenAPI
- Lucide React

## Arquitetura

```text
Usuário
  ↓
Interface Web
  ↓
Agente Microsoft Foundry
  ↓
API Netlify Function
  ↓
Supabase
  ↓
Painel administrativo
```

## Funcionalidades

- Home institucional do projeto SENAI Agenda IA.
- Formulário de agendamento para o caso demonstrativo de salão de beleza.
- Chat demonstrativo que consulta disponibilidade e cria agendamento.
- Painel de agendamentos com aviso pedagógico de acesso.
- Documentação didática para professores e alunos.
- Página de integração com Microsoft Foundry.
- OpenAPI para conectar as ferramentas ao agente.

## Estrutura

```text
.
|-- netlify/
|   `-- functions/
|       |-- consultar-disponibilidade.ts
|       |-- criar-agendamento.ts
|       `-- listar-agendamentos.ts
|-- public/
|   `-- openapi.yaml
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

## Como Rodar Localmente

```bash
npm install
npm run dev
```

Para testar redirects e Netlify Functions localmente:

```bash
npx netlify dev
```

Para validar build de produção:

```bash
npm run build
```

## Como Configurar o Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Execute o arquivo `supabase/schema.sql`.
4. Confirme que a tabela `public.agendamentos` foi criada.
5. Mantenha RLS habilitado.

Campos principais da tabela:

- `id`
- `nome`
- `whatsapp`
- `servico`
- `data`
- `horario`
- `observacoes`
- `status`
- `created_at`
- `updated_at`

O schema também mantém `telefone` e `mensagem` por compatibilidade com a primeira versão do projeto.

## Como Configurar a Netlify

Build command:

```bash
npm run build
```

Publish directory:

```bash
dist
```

Variáveis de ambiente:

```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_PUBLISHABLE_KEY=sua-publishable-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

Variáveis opcionais para variantes didáticas com leitura direta no frontend:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-ou-publishable-key
```

## Avisos de Segurança

- Nunca coloque `SUPABASE_SERVICE_ROLE_KEY` no frontend.
- Nunca use prefixos públicos como `VITE_`, `NEXT_PUBLIC_` ou `PUBLIC_` em uma service role.
- A service role deve existir apenas em Netlify Functions.
- O frontend chama apenas rotas `/api/*`.
- O `.env.example` não deve conter valores reais.
- RLS deve permanecer habilitado no Supabase.
- O painel está aberto apenas por ser um projeto pedagógico; em produção ele deve ter autenticação ou senha.

## Endpoints da API

### Consultar Disponibilidade

```text
POST /api/consultar-disponibilidade
```

Payload:

```json
{
  "data": "2026-05-15",
  "horario": "14:00"
}
```

Resposta:

```json
{
  "success": true,
  "disponivel": true,
  "message": "Horário disponível para agendamento.",
  "data": "2026-05-15",
  "horario": "14:00",
  "conflito": null
}
```

### Criar Agendamento

```text
POST /api/criar-agendamento
```

Payload:

```json
{
  "nome": "Juliana Alves",
  "whatsapp": "11988887777",
  "servico": "Hidratação",
  "data": "2026-05-15",
  "horario": "15:00",
  "observacoes": "Cliente prefere atendimento com profissional feminina"
}
```

Resposta:

```json
{
  "success": true,
  "message": "Agendamento registrado com sucesso",
  "status": "pendente",
  "data": {
    "id": "uuid-do-agendamento",
    "nome": "Juliana Alves",
    "whatsapp": "11988887777",
    "servico": "Hidratação",
    "data": "2026-05-15",
    "horario": "15:00",
    "observacoes": "Cliente prefere atendimento com profissional feminina",
    "status": "pendente"
  }
}
```

## Como Conectar ao Microsoft Foundry

1. Crie um agente no Microsoft Foundry.
2. Configure o prompt para coletar nome, WhatsApp, serviço, data e horário.
3. Adicione uma ferramenta usando o arquivo OpenAPI.
4. Configure a ferramenta `consultarDisponibilidade`.
5. Configure a ferramenta `criarAgendamento`.
6. Oriente o agente a consultar disponibilidade antes de criar o agendamento.
7. Teste uma conversa completa e confirme o registro no painel.

Endpoints públicos:

```text
https://agente-agendamento.netlify.app/api/consultar-disponibilidade
https://agente-agendamento.netlify.app/api/criar-agendamento
```

## Como Usar o openapi.yaml

Arquivo local:

```text
openapi.yaml
```

Arquivo publicado:

```text
https://agente-agendamento.netlify.app/openapi.yaml
```

O contrato usa:

- `operationId: consultarDisponibilidade`
- `operationId: criarAgendamento`
- campos obrigatórios do agendamento: `nome`, `whatsapp`, `servico`, `data`, `horario`
- campo opcional: `observacoes`

## Como Professores e Alunos Podem Replicar

1. Faça fork ou clone do repositório.
2. Crie um novo projeto Supabase.
3. Execute `supabase/schema.sql`.
4. Crie um novo site no Netlify.
5. Configure as variáveis de ambiente.
6. Publique o projeto.
7. Importe o `openapi.yaml` no Microsoft Foundry.
8. Configure o prompt do agente.
9. Teste consulta de disponibilidade.
10. Teste criação de agendamento.
11. Adapte o caso de uso para outra turma ou outro segmento.

## Prompt Base do Agente

```text
Você é o assistente SENAI Agenda IA.
Seu papel é coletar dados de agendamento de forma clara, educada e objetiva.
Colete obrigatoriamente: nome, WhatsApp, serviço, data e horário.
Antes de criar o agendamento, chame a ferramenta consultarDisponibilidade.
Se o horário estiver disponível e o usuário confirmar, chame a ferramenta criarAgendamento.
Não peça chaves de API ao usuário.
Não mencione service role.
Se algum dado estiver faltando, faça apenas a pergunta necessária.
Ao concluir, informe que o agendamento ficou com status pendente.
```

## Assinatura

Projeto desenvolvido por Rafael Risso, com inspiração e orientação do Professor Alexandre Becas Hernandes.

Curso MS FOUNDRY 2602 | SENAI | Maio de 2026
