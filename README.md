# SENAI Agenda IA

Projeto didatico de agente de agendamento conectado ao Microsoft Foundry, Supabase e Netlify.

## Informacoes

- Autor: Rafael Risso
- Professor: Alexandre Becas Hernandes
- Curso: MS FOUNDRY 2602
- Instituicao: SENAI
- Data: Maio de 2026
- Deploy: https://agente-agendamento.netlify.app/
- GitHub: https://github.com/SEU-USUARIO/SEU-REPOSITORIO

## Objetivo do Projeto

O SENAI Agenda IA demonstra como um agente criado no Microsoft Foundry pode ir alem da conversa. O agente coleta dados do usuario, chama uma API serverless hospedada na Netlify e registra informacoes reais no Supabase.

O caso de uso demonstrativo e um agendamento para salao de beleza, mas a arquitetura pode ser aplicada em escolas, clinicas, consultorias, oficinas, restaurantes, setores administrativos e atendimento interno de empresas.

## Tecnologias Utilizadas

- Microsoft Foundry
- React
- TypeScript
- Vite
- TailwindCSS como referencia didatica de stack visual moderna
- Supabase
- Netlify
- Netlify Functions
- OpenAPI
- Lucide React

## Arquitetura

```text
Usuario
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

## Estrutura

```text
.
|-- netlify/
|   `-- functions/
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

Para validar build de producao:

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

O schema tambem mantem `telefone` e `mensagem` por compatibilidade com a primeira versao do projeto.

## Como Configurar a Netlify

Build command:

```bash
npm run build
```

Publish directory:

```bash
dist
```

Variaveis de ambiente:

```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_PUBLISHABLE_KEY=sua-publishable-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

Variaveis opcionais para variantes didaticas com leitura direta no frontend:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-ou-publishable-key
```

## Avisos de Seguranca

- Nunca coloque `SUPABASE_SERVICE_ROLE_KEY` no frontend.
- Nunca use prefixos publicos como `VITE_`, `NEXT_PUBLIC_` ou `PUBLIC_` em uma service role.
- A service role deve existir apenas em Netlify Functions.
- O frontend chama apenas rotas `/api/*`.
- O `.env.example` nao deve conter valores reais.
- RLS deve permanecer habilitado no Supabase.

## Endpoint da API

```text
POST /api/criar-agendamento
```

Exemplo de payload:

```json
{
  "nome": "Juliana Alves",
  "whatsapp": "11988887777",
  "servico": "Hidratacao",
  "data": "2026-05-15",
  "horario": "15:00",
  "observacoes": "Cliente prefere atendimento com profissional feminina"
}
```

Exemplo de resposta:

```json
{
  "success": true,
  "message": "Agendamento registrado com sucesso",
  "status": "pendente",
  "data": {
    "id": "uuid-do-agendamento",
    "nome": "Juliana Alves",
    "whatsapp": "11988887777",
    "servico": "Hidratacao",
    "data": "2026-05-15",
    "horario": "15:00",
    "observacoes": "Cliente prefere atendimento com profissional feminina",
    "status": "pendente"
  }
}
```

## Como Conectar ao Microsoft Foundry

1. Crie um agente no Microsoft Foundry.
2. Configure o prompt para coletar nome, WhatsApp, servico, data e horario.
3. Adicione uma ferramenta usando o arquivo OpenAPI.
4. Configure a ferramenta para chamar `criarAgendamento`.
5. Teste uma conversa completa e confirme o registro no painel.

Endpoint publico:

```text
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

- `operationId: criarAgendamento`
- `POST /api/criar-agendamento`
- campos obrigatorios: `nome`, `whatsapp`, `servico`, `data`, `horario`
- campo opcional: `observacoes`

## Como Professores e Alunos Podem Replicar

1. Faça fork ou clone do repositorio.
2. Crie um novo projeto Supabase.
3. Execute `supabase/schema.sql`.
4. Crie um novo site no Netlify.
5. Configure as variaveis de ambiente.
6. Publique o projeto.
7. Importe o `openapi.yaml` no Microsoft Foundry.
8. Configure o prompt do agente.
9. Teste o fluxo completo.
10. Adapte o caso de uso para outra turma ou outro segmento.

## Prompt Base do Agente

```text
Voce e o assistente SENAI Agenda IA.
Seu papel e coletar dados de agendamento de forma clara, educada e objetiva.
Colete obrigatoriamente: nome, WhatsApp, servico, data e horario.
Nao peca chaves de API ao usuario.
Nao mencione service role.
Quando todos os dados estiverem completos, chame a ferramenta criarAgendamento.
Se algum dado estiver faltando, faca apenas a pergunta necessaria.
Ao concluir, informe que o agendamento ficou com status pendente.
```

## Assinatura

Projeto desenvolvido por Rafael Risso, com inspiracao e orientacao do Professor Alexandre Becas Hernandes.

Curso MS FOUNDRY 2602 | SENAI | Maio de 2026
