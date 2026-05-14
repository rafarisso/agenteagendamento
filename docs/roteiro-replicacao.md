# Roteiro de Replicação em Aula

Este roteiro resume a sequência recomendada para reproduzir o SENAI Agenda IA em outra turma.

## 1. Criar o Repositório

1. Criar um repositório no GitHub.
2. Enviar o código do projeto.
3. Confirmar que o repositório contém:
   - `src/`
   - `netlify/functions/`
   - `supabase/schema.sql`
   - `openapi.yaml`
   - `docs/foundry-openapi-tool.json`
   - `docs/prompt-agente-foundry.md`

## 2. Criar o Projeto no Supabase

1. Criar um novo projeto no Supabase.
2. Abrir o SQL Editor.
3. Executar o conteúdo de `supabase/schema.sql`.
4. Abrir **Settings > API Keys**.
5. Copiar:
   - Project URL
   - Publishable key
   - Secret key ou service role equivalente

Observação: a chave secreta deve ser usada apenas no backend.

## 3. Criar o Site na Netlify

1. Criar um novo projeto a partir do GitHub.
2. Usar:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Configurar variáveis de ambiente:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_PUBLISHABLE_KEY`
4. Publicar o site.
5. Testar:
   - `/`
   - `/chat`
   - `/painel`
   - `/documentacao`

## 4. Criar a Ferramenta OpenAPI no Foundry

1. Abrir o agente no Microsoft Foundry.
2. Ir em **Ferramentas**.
3. Clicar em **Adicionar**.
4. Abrir a aba **Personalizado**.
5. Selecionar **Ferramenta OpenAPI**.
6. Clicar em **Criar**.
7. Nome:

```text
senai_agenda_ia_api
```

8. Descrição:

```text
API do SENAI Agenda IA para consultar disponibilidade e criar agendamentos reais no Supabase via Netlify Functions.
```

9. Autenticação:

```text
Anônimo
```

10. Colar o JSON de `docs/foundry-openapi-tool.json`.
11. Criar a ferramenta.
12. Confirmar que as operações aparecem no agente.

## 5. Configurar o Prompt do Agente

1. Abrir o campo **Instruções**.
2. Colar o conteúdo de `docs/prompt-agente-foundry.md`.
3. Salvar o agente.
4. Testar no Playground.

## 6. Teste Principal

Mensagem de teste:

```text
Quero cortar o cabelo sexta à tarde.
```

Resultado esperado:

1. O agente interpreta `corte` como `Corte masculino`.
2. O agente interpreta `sexta à tarde` como `2026-05-15` e período `tarde`.
3. O agente chama `consultarDisponibilidade`.
4. O agente sugere os horários retornados.
5. O usuário escolhe um horário.
6. O agente pede nome e WhatsApp.
7. O agente confirma os dados.
8. O agente chama `criarAgendamento`.
9. O Painel Didático exibe o registro.

## 7. Onde Verificar Erros

- Foundry: aba **Rastreamentos** para verificar `openapi_call`.
- Netlify: Deploy logs e Function logs.
- Supabase: tabela `public.agendamentos`.
- Site: rota `/painel`.

## 8. Pontos para Explicar aos Alunos

- O agente não acessa o banco diretamente.
- A API é o contrato entre o agente e o sistema.
- A Netlify Function é o backend seguro.
- O Supabase armazena o registro real.
- O painel demonstra o resultado.
- Em produção, o painel precisaria de autenticação.
