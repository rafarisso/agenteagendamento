# SENAI Agenda IA

Laboratório didático de agente de agendamento com Microsoft Foundry, Supabase e Netlify.

## Informações do Projeto

- Projeto: SENAI Agenda IA
- Curso: MS FOUNDRY 2602
- Instituição: SENAI
- Professor homenageado: Alexandre Becas Hernandes
- Desenvolvido por: Rafael Risso
- Data: Maio de 2026
- Deploy: https://agente-agendamento.netlify.app/
- Repositório: https://github.com/rafarisso/agenteagendamento

## Tese do Projeto

Este projeto demonstra a diferença entre um chatbot comum e um agente conectado a ferramentas reais.

O agente não apenas responde em texto. Ele entende a solicitação do usuário, consulta disponibilidade, sugere horários, chama uma API serverless e registra o agendamento em uma tabela real no Supabase.

O caso de uso demonstrativo é um agendamento para salão de beleza. O cenário foi escolhido por ser fácil de entender em sala de aula, mas a mesma arquitetura pode ser adaptada para clínicas, escolas, oficinas, consultorias, laboratórios, atendimento interno e outros serviços.

## Resultado Esperado

Ao final do fluxo, o aluno consegue demonstrar:

1. Uma conversa natural com um agente no Microsoft Foundry.
2. A chamada de uma ferramenta OpenAPI pelo agente.
3. A consulta real de disponibilidade por Netlify Function.
4. A criação de um agendamento no Supabase.
5. A visualização do registro no Painel Didático do site.

## Tecnologias Utilizadas

- Microsoft Foundry
- React
- TypeScript
- Vite
- Supabase
- PostgreSQL
- Netlify
- Netlify Functions
- OpenAPI 3.0

## Arquitetura

```text
Usuário
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

Ponto importante: o agente não conversa diretamente com o banco de dados. Ele chama endpoints HTTP descritos por OpenAPI. As Netlify Functions recebem os dados, validam as regras de negócio e acessam o Supabase no backend.

## Rotas do Site

- `/` - Home institucional do projeto.
- `/chat` - Demonstração didática com chat no site.
- `/painel` - Painel Didático com registros vindos do Supabase.
- `/documentacao` - Documentação do projeto para professores e alunos.
- `/sobre` - Informações institucionais e créditos.
- `/simulador-api` - Simulador técnico para testar a API sem usar o chat.

## Endpoints

### GET `/api/disponibilidade?data=YYYY-MM-DD`

Lista todos os horários didáticos de uma data e informa se cada slot está disponível.

Exemplo:

```bash
GET https://agente-agendamento.netlify.app/api/disponibilidade?data=2026-05-15
```

### POST `/api/consultar-disponibilidade`

Consulta horários livres para uma data, serviço e período.

Payload:

```json
{
  "data": "2026-05-15",
  "servico": "Corte masculino",
  "periodo": "tarde"
}
```

Resposta esperada:

```json
{
  "success": true,
  "data": "2026-05-15",
  "servico": "Corte masculino",
  "periodo": "tarde",
  "horariosDisponiveis": ["14:00", "15:30", "16:30"],
  "mensagem": "Encontrei 3 horários disponíveis para esse período."
}
```

### POST `/api/criar-agendamento`

Cria o agendamento no Supabase. Este endpoint deve ser chamado somente depois da consulta de disponibilidade e da confirmação do usuário.

Payload:

```json
{
  "nome": "Rafael Risso",
  "whatsapp": "11910950968",
  "servico": "Corte masculino",
  "data": "2026-05-15",
  "horario": "15:30",
  "observacoes": "Agendamento criado pelo agente do Microsoft Foundry",
  "origem": "foundry"
}
```

Resposta esperada:

```json
{
  "success": true,
  "message": "Agendamento registrado com sucesso",
  "status": "pendente"
}
```

## Regras de Negócio

- Não há atendimento aos domingos.
- Não há atendimento às segundas-feiras.
- Horários de manhã: `09:00` e `10:30`.
- Horários de tarde: `14:00`, `15:30` e `16:30`.
- Não existe atendimento à noite.
- Não cria agendamento em horário já ocupado.
- Não cria agendamento sem nome, WhatsApp, serviço, data e horário.
- Status inicial: `pendente`.
- Origens aceitas: `chat`, `manual`, `foundry` e `teste`.

## Banco de Dados Supabase

Execute o arquivo [`supabase/schema.sql`](supabase/schema.sql) no SQL Editor do Supabase.

A tabela principal é `public.agendamentos`.

Campos principais:

- `id`
- `nome`
- `email`
- `telefone`
- `whatsapp`
- `servico`
- `data`
- `horario`
- `mensagem`
- `observacoes`
- `status`
- `origem`
- `metadata`
- `created_at`
- `updated_at`

O schema também cria:

- constraints para `status`
- constraints para `origem`
- índice por data
- índice por horário
- índice por status
- índice por origem
- índice único para impedir conflito de horário ativo
- trigger para atualizar `updated_at`
- RLS habilitado

## Variáveis de Ambiente

Configure na Netlify:

```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-secreta-do-supabase
SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel-do-supabase
```

Para desenvolvimento local, use o arquivo `.env` ou variáveis do ambiente. O arquivo [`.env.example`](.env.example) contém apenas placeholders.

Regra de segurança:

- `SUPABASE_SERVICE_ROLE_KEY` deve ser usada somente nas Netlify Functions.
- Nunca use `SUPABASE_SERVICE_ROLE_KEY` no frontend.
- Nunca coloque chaves reais no GitHub.
- A ferramenta OpenAPI do Foundry não precisa de chave do Supabase.

## Como Rodar Localmente

Instale dependências:

```bash
npm install
```

Rode o site:

```bash
npm run dev
```

Valide o build:

```bash
npm run build
```

Teste com Netlify Functions localmente:

```bash
npx netlify dev
```

## Como Publicar na Netlify

Configuração esperada:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

O arquivo [`netlify.toml`](netlify.toml) já contém:

- comando de build
- diretório de publicação
- diretório das Functions
- redirects dos endpoints `/api/*`
- fallback da SPA para `index.html`
- headers básicos de segurança

Depois de configurar as variáveis de ambiente na Netlify, faça deploy pelo painel ou pelo GitHub conectado.

## Como Criar a Ferramenta OpenAPI no Microsoft Foundry

No agente do Microsoft Foundry:

1. Abra o agente no Foundry.
2. Vá em **Ferramentas**.
3. Clique em **Adicionar**.
4. Selecione a aba **Personalizado**.
5. Escolha **Ferramenta OpenAPI**.
6. Clique em **Criar**.
7. Preencha o nome:

```text
senai_agenda_ia_api
```

8. Preencha a descrição:

```text
API do SENAI Agenda IA para consultar disponibilidade e criar agendamentos reais no Supabase via Netlify Functions.
```

9. Em autenticação, escolha:

```text
Anônimo
```

10. No campo **Esquema OpenAPI3.0+**, cole o JSON do arquivo:

```text
docs/foundry-openapi-tool.json
```

Observação importante: em alguns momentos o Foundry aceita YAML por URL, mas nesta tela manual ele pode validar o conteúdo como JSON. Se aparecer erro de "formato JSON inválido", use o arquivo JSON acima, sem crases, sem comentários e sem texto antes ou depois.

11. Clique em **Criar ferramenta**.
12. Confirme se a ferramenta aparece na lista do agente.
13. Salve o agente.

Operações esperadas:

- `consultarDisponibilidade`
- `criarAgendamento`

## Prompt do Agente

O prompt completo está no arquivo:

```text
docs/prompt-agente-foundry.md
```

Resumo das instruções essenciais:

- Conversar naturalmente.
- Interpretar datas relativas a partir de 14/05/2026 para a demonstração.
- Converter datas para `YYYY-MM-DD` ao chamar a API.
- Consultar disponibilidade antes de sugerir horários.
- Sugerir somente horários retornados pela API.
- Coletar nome e WhatsApp.
- Confirmar os dados antes de criar.
- Chamar `criarAgendamento` somente após confirmação.
- Enviar `origem` como `foundry`.
- Nunca dizer que salvou no Supabase sem receber `success=true`.

## Como Testar no Foundry

Depois de criar a ferramenta e salvar o prompt, teste no Playground:

```text
Quero cortar o cabelo sexta à tarde.
```

Com a data de referência do curso, o agente deve interpretar como:

```json
{
  "data": "2026-05-15",
  "servico": "Corte masculino",
  "periodo": "tarde"
}
```

Comportamento esperado:

1. O agente chama `consultarDisponibilidade`.
2. O Foundry mostra um evento `openapi_call` nos rastreamentos.
3. O agente oferece horários retornados pela API.
4. O usuário escolhe um horário.
5. O agente pede nome e WhatsApp.
6. O agente confirma os dados.
7. O usuário autoriza.
8. O agente chama `criarAgendamento`.
9. O registro aparece em `/painel`.

## Troubleshooting

### O Foundry diz que o JSON é inválido

Use o arquivo `docs/foundry-openapi-tool.json`. Não cole YAML nessa tela. Não inclua crases, comentários ou texto fora do objeto JSON.

### O agente responde, mas não chama a API

Verifique:

- se a ferramenta `senai_agenda_ia_api` está adicionada ao agente;
- se o agente foi salvo depois da ferramenta;
- se o prompt diz explicitamente para chamar `consultarDisponibilidade`;
- se a aba **Rastreamentos** mostra `openapi_call`.

### O agente pede a data completa mesmo quando o usuário diz "sexta"

Atualize o bloco de regras de data no prompt. Para a aula, a data de referência documentada é `14/05/2026`.

### A API retorna erro 400

Verifique se o payload usa:

- `data` no formato `YYYY-MM-DD`;
- `periodo` como `manha` ou `tarde`;
- `servico` com um nome aceito;
- `horario` no formato `HH:MM`.

### A API retorna erro 409

O horário já está ocupado por um agendamento com status `pendente` ou `confirmado`.

### O painel não carrega

Verifique as variáveis `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` na Netlify.

## Segurança em Produção

Este projeto é didático. Por isso, o Painel Didático fica acessível para demonstração.

Em um projeto real:

- proteger o painel com autenticação;
- aplicar permissões por usuário;
- revisar as políticas de RLS;
- não expor service role;
- validar payload sempre no servidor;
- registrar logs com cuidado;
- restringir domínios e rotas administrativas;
- usar ambiente separado para produção.

## Arquivos Importantes

- [`src/App.tsx`](src/App.tsx) - interface, rotas e experiência didática.
- [`src/lib/api.ts`](src/lib/api.ts) - cliente HTTP usado pelo frontend.
- [`netlify/functions/_shared/schedule.ts`](netlify/functions/_shared/schedule.ts) - regras compartilhadas de agenda.
- [`netlify/functions/consultar-disponibilidade.ts`](netlify/functions/consultar-disponibilidade.ts) - consulta de disponibilidade.
- [`netlify/functions/criar-agendamento.ts`](netlify/functions/criar-agendamento.ts) - criação de agendamento.
- [`netlify/functions/listar-agendamentos.ts`](netlify/functions/listar-agendamentos.ts) - leitura para o painel.
- [`openapi.yaml`](openapi.yaml) - especificação OpenAPI publicada para integração.
- [`docs/foundry-openapi-tool.json`](docs/foundry-openapi-tool.json) - versão JSON para colar no Foundry.
- [`docs/prompt-agente-foundry.md`](docs/prompt-agente-foundry.md) - prompt completo do agente.
- [`supabase/schema.sql`](supabase/schema.sql) - schema do banco.

## Referências

- Documentação Microsoft sobre ferramentas OpenAPI em agentes do Foundry: https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/tools/openapi
- Documentação Supabase sobre segurança de APIs e RLS: https://supabase.com/docs/guides/api/securing-your-api
- Documentação Netlify Functions: https://docs.netlify.com/build/functions/overview/

## Créditos

Projeto desenvolvido por Rafael Risso, com inspiração e orientação do Professor Alexandre Becas Hernandes.

Curso MS FOUNDRY 2602 | SENAI | Maio de 2026
