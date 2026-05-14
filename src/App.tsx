import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  ExternalLink,
  FileCode2,
  GraduationCap,
  Home,
  Loader2,
  MessageSquareText,
  Network,
  PanelTop,
  Phone,
  ServerCog,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { createAppointment, listAppointments } from "./lib/api";
import type { AppointmentForm, AppointmentRecord, AppointmentResponse } from "./types";

const repoUrl = "https://github.com/SEU-USUARIO/SEU-REPOSITORIO";
const deployUrl = "https://agente-agendamento.netlify.app";
const openApiUrl = `${deployUrl}/openapi.yaml`;

const services = [
  "Corte masculino",
  "Hidratacao",
  "Escova",
  "Coloracao",
  "Diagnostico Foundry",
  "Automacao com Agentes",
  "Integracao Supabase",
  "Mentoria tecnica",
];

const slots = [
  { hour: "09:00", label: "Primeira janela", load: 42 },
  { hour: "11:30", label: "Atendimento guiado", load: 55 },
  { hour: "14:00", label: "Fluxo de demonstracao", load: 68 },
  { hour: "16:30", label: "Revisao do case", load: 31 },
];

const techBadges = [
  "Microsoft Foundry",
  "Supabase",
  "Netlify",
  "React",
  "TypeScript",
  "SENAI",
  "MS FOUNDRY 2602",
];

const howItWorks = [
  "O usuario conversa com o agente",
  "O agente coleta nome, WhatsApp, servico, data e horario",
  "O agente chama uma API",
  "A Netlify Function valida e envia os dados",
  "O Supabase registra o agendamento",
  "O painel exibe o resultado",
];

const initialForm: AppointmentForm = {
  nome: "",
  whatsapp: "",
  servico: services[0],
  data: "",
  horario: "09:00",
  observacoes: "",
  email: "",
};

const sampleAppointments: AppointmentRecord[] = [
  {
    id: "demo-001",
    nome: "Juliana Alves",
    whatsapp: "11988887777",
    servico: "Hidratacao",
    data: "2026-05-15",
    horario: "15:00",
    observacoes: "Caso de uso demonstrativo para salao de beleza.",
    status: "pendente",
    created_at: "2026-05-14T13:00:00.000Z",
  },
  {
    id: "demo-002",
    nome: "Rafael Risso",
    whatsapp: "11910950968",
    servico: "Corte masculino",
    data: "2026-05-15",
    horario: "14:00",
    observacoes: "Teste realizado no curso MS FOUNDRY 2602.",
    status: "confirmado",
    created_at: "2026-05-14T13:20:00.000Z",
  },
];

const navItems = [
  { label: "Inicio", path: "/", icon: Home },
  { label: "Agendar", path: "/agendar", icon: CalendarDays },
  { label: "Painel", path: "/painel", icon: PanelTop },
  { label: "Documentacao", path: "/documentacao", icon: BookOpen },
  { label: "Integracao Foundry", path: "/integracao-foundry", icon: Network },
  { label: "Sobre o Projeto", path: "/sobre", icon: GraduationCap },
];

function App() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));

  useEffect(() => {
    function handlePopState() {
      setPath(normalizePath(window.location.pathname));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(nextPath: string) {
    window.history.pushState({}, "", nextPath);
    setPath(normalizePath(nextPath));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const page = useMemo(() => {
    switch (path) {
      case "/agendar":
        return <SchedulePage />;
      case "/painel":
        return <PanelPage />;
      case "/documentacao":
        return <DocumentationPage />;
      case "/integracao-foundry":
        return <FoundryPage />;
      case "/sobre":
        return <AboutPage />;
      default:
        return <HomePage navigate={navigate} />;
    }
  }, [path]);

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="/" onClick={(event) => handleNav(event, "/", navigate)}>
          <span className="brand-mark">S</span>
          <span>
            <strong>SENAI Agenda IA</strong>
            <small>MS FOUNDRY 2602</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="Navegacao principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.path}
                className={path === item.path ? "active" : ""}
                href={item.path}
                onClick={(event) => handleNav(event, item.path, navigate)}
              >
                <Icon size={16} />
                {item.label}
              </a>
            );
          })}
        </nav>
      </header>

      <main>{page}</main>

      <footer className="site-footer">
        <p>
          Projeto desenvolvido por Rafael Risso, com inspiracao e orientacao do Professor Alexandre
          Becas Hernandes.
        </p>
        <strong>Curso MS FOUNDRY 2602 | SENAI | Maio de 2026</strong>
      </footer>
    </div>
  );
}

function HomePage({ navigate }: { navigate: (path: string) => void }) {
  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <span className="section-kicker">
            <Sparkles size={16} />
            Case didatico institucional
          </span>
          <h1>SENAI Agenda IA</h1>
          <p className="hero-subtitle">
            Um agente de agendamento conectado ao Microsoft Foundry, Supabase e Netlify.
          </p>
          <p className="hero-copy">
            Projeto didatico desenvolvido para demonstrar como um agente de IA pode ir alem da
            conversa: ele coleta dados do usuario, aciona uma API serverless e registra informacoes
            reais em um banco de dados.
          </p>

          <div className="badge-row">
            {techBadges.map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>

          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={() => navigate("/agendar")}>
              <CalendarDays size={18} />
              Testar agendamento
            </button>
            <button className="secondary-button" type="button" onClick={() => navigate("/documentacao")}>
              <BookOpen size={18} />
              Ver documentacao
            </button>
            <button className="ghost-button" type="button" onClick={() => navigate("/painel")}>
              <PanelTop size={18} />
              Ver painel
            </button>
          </div>
        </div>

        <div className="lab-panel" aria-label="Resumo da arquitetura">
          <div className="panel-toolbar">
            <span />
            <span />
            <span />
          </div>
          <div className="pipeline-card">
            <PipelineItem icon={MessageSquareText} title="Agente" text="Coleta dados no Foundry" />
            <PipelineItem icon={ServerCog} title="API" text="Netlify Function valida" />
            <PipelineItem icon={Database} title="Banco" text="Supabase registra" />
          </div>
          <div className="code-window">
            <code>POST /api/criar-agendamento</code>
            <small>operationId: criarAgendamento</small>
          </div>
        </div>
      </section>

      <section className="content-section" aria-labelledby="how-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Como funciona</span>
            <h2 id="how-title">Da conversa ao registro real</h2>
          </div>
          <span className="section-pill">Fluxo replicavel</span>
        </div>

        <div className="steps-grid">
          {howItWorks.map((step, index) => (
            <article className="step-card" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>

        <blockquote className="impact-quote">
          A diferenca aqui e simples: este agente nao apenas responde, ele executa uma acao real.
        </blockquote>
      </section>
    </>
  );
}

function SchedulePage() {
  const [form, setForm] = useState<AppointmentForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AppointmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.hour === form.horario) ?? slots[0],
    [form.horario],
  );

  function updateField<Key extends keyof AppointmentForm>(field: Key, value: AppointmentForm[Key]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await createAppointment(form);
      setResult(response);
      setForm((current) => ({
        ...initialForm,
        servico: current.servico,
        horario: current.horario,
      }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Erro inesperado no envio.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page-grid">
      <div className="form-surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Caso de uso demonstrativo</span>
            <h1>Agendamento para salao de beleza</h1>
            <p>
              Este formulario simula os mesmos dados que o agente do Microsoft Foundry deve coletar
              antes de chamar a API.
            </p>
          </div>
          <CalendarDays size={30} />
        </div>

        <form className="appointment-form" onSubmit={handleSubmit}>
          <label>
            <span>Nome completo</span>
            <div className="input-wrap">
              <UserRound size={18} />
              <input
                value={form.nome}
                onChange={(event) => updateField("nome", event.target.value)}
                placeholder="Juliana Alves"
                autoComplete="name"
                required
              />
            </div>
          </label>

          <div className="field-grid">
            <label>
              <span>WhatsApp</span>
              <div className="input-wrap">
                <Phone size={18} />
                <input
                  value={form.whatsapp}
                  onChange={(event) => updateField("whatsapp", event.target.value)}
                  placeholder="11988887777"
                  autoComplete="tel"
                  required
                />
              </div>
            </label>
            <label>
              <span>Email opcional</span>
              <div className="input-wrap">
                <MessageSquareText size={18} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="contato@email.com"
                  autoComplete="email"
                />
              </div>
            </label>
          </div>

          <fieldset className="service-picker">
            <legend>Servico</legend>
            {services.map((service) => (
              <button
                key={service}
                type="button"
                className={form.servico === service ? "selected" : ""}
                onClick={() => updateField("servico", service)}
              >
                {service}
              </button>
            ))}
          </fieldset>

          <div className="field-grid">
            <label>
              <span>Data</span>
              <div className="input-wrap">
                <CalendarDays size={18} />
                <input
                  type="date"
                  value={form.data}
                  onChange={(event) => updateField("data", event.target.value)}
                  required
                />
              </div>
            </label>
            <label>
              <span>Horario</span>
              <div className="input-wrap">
                <Clock3 size={18} />
                <select
                  value={form.horario}
                  onChange={(event) => updateField("horario", event.target.value)}
                >
                  {slots.map((slot) => (
                    <option key={slot.hour} value={slot.hour}>
                      {slot.hour}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          <label>
            <span>Observacoes</span>
            <textarea
              value={form.observacoes}
              onChange={(event) => updateField("observacoes", event.target.value)}
              placeholder="Cliente prefere atendimento com profissional feminina."
              rows={5}
            />
          </label>

          {error ? <p className="feedback error">{error}</p> : null}
          {result ? (
            <p className="feedback success">
              <BadgeCheck size={18} />
              {result.message} Protocolo: {result.id.slice(0, 8)}
            </p>
          ) : null}

          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="spin" size={20} /> : <CalendarDays size={20} />}
            Criar agendamento
          </button>
        </form>
      </div>

      <aside className="agenda-surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Janelas de exemplo</span>
            <h2>Disponibilidade</h2>
          </div>
          <span className="date-pill">Maio 2026</span>
        </div>

        <div className="slot-list">
          {slots.map((slot) => (
            <button
              key={slot.hour}
              type="button"
              className={`slot-row ${form.horario === slot.hour ? "active" : ""}`}
              onClick={() => updateField("horario", slot.hour)}
            >
              <span className="slot-time">{slot.hour}</span>
              <span className="slot-label">{slot.label}</span>
              <span className="slot-meter" aria-label={`${slot.load}% de ocupacao`}>
                <span style={{ width: `${slot.load}%` }} />
              </span>
            </button>
          ))}
        </div>

        <div className="security-panel">
          <div>
            <ShieldCheck size={24} />
            <h3>Arquitetura segura</h3>
          </div>
          <ul>
            <li>O frontend chama somente a rota publica da Netlify.</li>
            <li>A Function valida o payload antes de gravar.</li>
            <li>A service role, quando usada, fica apenas no servidor.</li>
          </ul>
          <strong>Slot selecionado: {selectedSlot.hour}</strong>
        </div>
      </aside>
    </section>
  );
}

function PanelPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(sampleAppointments);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAppointments() {
      try {
        const records = await listAppointments();
        if (active && records.length > 0) {
          setAppointments(records);
          setNotice(null);
        }
      } catch (requestError) {
        if (active) {
          setNotice(
            requestError instanceof Error
              ? requestError.message
              : "Nao foi possivel carregar os agendamentos reais.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadAppointments();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Painel</span>
          <h1>Agendamentos registrados</h1>
          <p>
            Area de leitura para demonstrar que a conversa com o agente pode gerar registros reais
            no Supabase.
          </p>
        </div>
        <PanelTop size={32} />
      </div>

      {notice ? (
        <p className="feedback warning">
          {notice} Exibindo registros de demonstracao para a apresentacao.
        </p>
      ) : null}

      <div className="metric-grid">
        <MetricCard label="Registros visiveis" value={appointments.length.toString()} />
        <MetricCard label="Status pendente" value={appointments.filter((item) => item.status === "pendente").length.toString()} />
        <MetricCard label="Origem" value={isLoading ? "Carregando" : notice ? "Demo" : "Supabase"} />
      </div>

      <div className="table-card">
        <div className="table-header">
          <strong>Fila de agendamentos</strong>
          {isLoading ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
        </div>
        <div className="appointment-list">
          {appointments.map((appointment) => (
            <article className="appointment-row" key={appointment.id}>
              <div>
                <strong>{appointment.nome}</strong>
                <span>{appointment.whatsapp}</span>
              </div>
              <div>
                <strong>{appointment.servico}</strong>
                <span>
                  {appointment.data} as {appointment.horario}
                </span>
              </div>
              <span className={`status-badge ${appointment.status}`}>{appointment.status}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DocumentationPage() {
  return (
    <article className="doc-page">
      <PageIntro
        kicker="Documentacao"
        title="Documentacao do Projeto"
        subtitle="Material de apoio para professores e alunos replicarem o SENAI Agenda IA em outras turmas."
      />

      <DocSection title="A. Visao geral">
        <p>
          O SENAI Agenda IA e um case didatico de agente de IA com acao real. Ele conecta uma
          interface web, um agente criado no Microsoft Foundry, uma API serverless e uma base de
          dados Supabase.
        </p>
      </DocSection>

      <DocSection title="B. Objetivo pedagogico">
        <p>
          O objetivo e mostrar o ciclo completo: prompt do agente, interface web, API, banco de
          dados e deploy. O aluno visualiza como uma conversa estruturada se transforma em registro
          persistente.
        </p>
      </DocSection>

      <DocSection title="C. Tecnologias utilizadas">
        <div className="badge-row doc-badges">
          {[
            "Microsoft Foundry",
            "React",
            "TypeScript",
            "Vite",
            "TailwindCSS",
            "Supabase",
            "Netlify",
            "Netlify Functions",
            "OpenAPI",
          ].map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
      </DocSection>

      <DocSection title="D. Arquitetura do sistema">
        <FlowList
          items={[
            "Usuario",
            "Interface Web",
            "Agente Microsoft Foundry",
            "API Netlify Function",
            "Supabase",
            "Painel administrativo",
          ]}
        />
      </DocSection>

      <DocSection title="E. Passo a passo para replicar">
        <NumberedList
          items={[
            "Criar projeto no Microsoft Foundry",
            "Criar agente no Foundry",
            "Configurar prompt do agente",
            "Criar projeto React com Vite",
            "Criar tabela no Supabase",
            "Configurar variaveis de ambiente",
            "Criar Netlify Function",
            "Criar arquivo OpenAPI",
            "Publicar na Netlify",
            "Conectar a API ao agente",
            "Testar o fluxo completo",
          ]}
        />
      </DocSection>

      <DocSection title="F. Configuracao do Supabase">
        <p>Estrutura didatica da tabela <code>agendamentos</code>:</p>
        <div className="schema-grid">
          {[
            "id",
            "nome",
            "whatsapp",
            "servico",
            "data",
            "horario",
            "observacoes",
            "status",
            "created_at",
            "updated_at",
          ].map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>
        <CodeBlock
          code={`create table if not exists public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  whatsapp text not null,
  servico text not null,
  data date not null,
  horario time without time zone not null,
  observacoes text,
  status text not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);`}
        />
      </DocSection>

      <DocSection title="G. Configuracao da Netlify">
        <p>
          Configure as variaveis no painel da Netlify. A service role deve ser usada apenas nas
          Netlify Functions e nunca no frontend.
        </p>
        <KeyValueList
          items={[
            ["VITE_SUPABASE_URL", "Opcional para variantes que leem dados no frontend."],
            ["VITE_SUPABASE_ANON_KEY", "Opcional; nunca substitui validacao server-side."],
            ["SUPABASE_URL", "URL do projeto Supabase usada pelas Functions."],
            ["SUPABASE_SERVICE_ROLE_KEY", "Chave server-side para painel e operacoes administrativas."],
          ]}
        />
      </DocSection>

      <DocSection title="H. Endpoint da API">
        <p><code>POST /api/criar-agendamento</code></p>
        <CodeBlock
          code={`{
  "nome": "Juliana Alves",
  "whatsapp": "11988887777",
  "servico": "Hidratacao",
  "data": "2026-05-15",
  "horario": "15:00",
  "observacoes": "Cliente prefere atendimento com profissional feminina"
}`}
        />
        <CodeBlock
          code={`{
  "success": true,
  "message": "Agendamento registrado com sucesso",
  "status": "pendente"
}`}
        />
      </DocSection>

      <DocSection title="I. Como usar com Microsoft Foundry">
        <p>
          O agente deve coletar nome, WhatsApp, servico, data e horario. Depois, ele chama:
        </p>
        <CodeBlock code={`POST ${deployUrl}/api/criar-agendamento`} />
      </DocSection>

      <DocSection title="J. Prompt base do agente">
        <CodeBlock
          code={`Voce e o assistente SENAI Agenda IA.
Seu papel e coletar dados de agendamento de forma clara, educada e objetiva.
Colete obrigatoriamente: nome, WhatsApp, servico, data e horario.
Nao peca chaves de API ao usuario.
Nao mencione service role.
Quando todos os dados estiverem completos, chame a ferramenta criarAgendamento.
Se algum dado estiver faltando, faca apenas a pergunta necessaria.
Ao concluir, informe que o agendamento ficou com status pendente.`}
        />
      </DocSection>

      <DocSection title="K. Repositorio">
        <a className="primary-link" href={repoUrl} target="_blank" rel="noreferrer">
          Ver repositorio no GitHub
          <ExternalLink size={16} />
        </a>
      </DocSection>
    </article>
  );
}

function FoundryPage() {
  return (
    <article className="doc-page">
      <PageIntro
        kicker="Integracao"
        title="Integracao com Microsoft Foundry"
        subtitle="Este projeto foi preparado para receber dados de um agente criado no Microsoft Foundry."
      />

      <DocSection title="Fluxo da integracao">
        <FlowList
          items={[
            "Microsoft Foundry Agent",
            "Ferramenta ou chamada HTTP",
            "Endpoint /api/criar-agendamento",
            "Netlify Function",
            "Supabase",
          ]}
        />
      </DocSection>

      <DocSection title="Arquivo OpenAPI">
        <p>
          O arquivo <code>openapi.yaml</code> descreve a API para o Foundry. A versao publicada esta
          disponivel em:
        </p>
        <a className="primary-link" href={openApiUrl} target="_blank" rel="noreferrer">
          {openApiUrl}
          <ExternalLink size={16} />
        </a>
        <CodeBlock
          code={`operationId: criarAgendamento
endpoint: POST /api/criar-agendamento
descricao: cria uma nova solicitacao de agendamento no Supabase`}
        />
      </DocSection>

      <DocSection title="Teste manual da API">
        <CodeBlock
          code={`fetch('/api/criar-agendamento', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nome: 'Rafael Risso',
    whatsapp: '11910950968',
    servico: 'Corte masculino',
    data: '2026-05-15',
    horario: '14:00',
    observacoes: 'Teste realizado no curso MS FOUNDRY 2602'
  })
})`}
        />
      </DocSection>
    </article>
  );
}

function AboutPage() {
  return (
    <article className="doc-page">
      <PageIntro
        kicker="Sobre"
        title="Sobre o SENAI Agenda IA"
        subtitle="Projeto didatico criado por Rafael Risso durante o curso MS FOUNDRY 2602."
      />

      <DocSection title="Origem do projeto">
        <p>
          O SENAI Agenda IA e um projeto didatico criado por Rafael Risso durante o curso MS FOUNDRY
          2602, com inspiracao e orientacao do Professor Alexandre Becas Hernandes.
        </p>
        <p>
          A proposta e demonstrar, de maneira pratica, como agentes de IA podem ser conectados a
          ferramentas reais, permitindo que uma conversa gere uma acao concreta, como registrar um
          agendamento em banco de dados.
        </p>
      </DocSection>

      <DocSection title="Por que este projeto importa?">
        <p>
          Muitos exemplos de IA ficam limitados a respostas em texto. Este projeto mostra uma
          aplicacao mais proxima do mercado: um agente que entende a solicitacao, organiza os dados,
          chama uma API e registra tudo em uma base real.
        </p>
      </DocSection>

      <DocSection title="Aplicacoes possiveis">
        <div className="application-grid">
          {[
            "Saloes de beleza",
            "Barbearias",
            "Clinicas",
            "Escolas",
            "Oficinas",
            "Consultorias",
            "Restaurantes",
            "Setores administrativos",
            "Atendimento interno de empresas",
          ].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </DocSection>
    </article>
  );
}

function PipelineItem({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof MessageSquareText;
  title: string;
  text: string;
}) {
  return (
    <div className="pipeline-item">
      <Icon size={22} />
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function PageIntro({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle: string;
}) {
  return (
    <header className="page-intro">
      <span className="section-kicker">
        <FileCode2 size={16} />
        {kicker}
      </span>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}

function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="doc-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function FlowList({ items }: { items: string[] }) {
  return (
    <div className="flow-list">
      {items.map((item, index) => (
        <div className="flow-node" key={item}>
          <span>{item}</span>
          {index < items.length - 1 ? <ChevronRight size={20} /> : null}
        </div>
      ))}
    </div>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="numbered-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}

function KeyValueList({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="key-list">
      {items.map(([key, value]) => (
        <div key={key}>
          <code>{key}</code>
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="code-block">
      <code>{code}</code>
    </pre>
  );
}

function handleNav(
  event: MouseEvent<HTMLAnchorElement>,
  path: string,
  navigate: (path: string) => void,
) {
  event.preventDefault();
  navigate(path);
}

function normalizePath(path: string) {
  return path === "" ? "/" : path.replace(/\/$/, "") || "/";
}

export default App;
