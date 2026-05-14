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
  Send,
  ServerCog,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { checkAvailability, createAppointment, listAppointments } from "./lib/api";
import type { AppointmentForm, AppointmentRecord, AppointmentResponse } from "./types";

const repoUrl = "https://github.com/rafarisso/agenteagendamento";
const deployUrl = "https://agente-agendamento.netlify.app";
const openApiUrl = `${deployUrl}/openapi.yaml`;

const services = [
  "Corte masculino",
  "Hidratação",
  "Escova",
  "Coloração",
  "Diagnóstico Foundry",
  "Automação com Agentes",
  "Integração Supabase",
  "Mentoria técnica",
];

const slots = [
  { hour: "09:00", label: "Primeira janela", load: 42 },
  { hour: "11:30", label: "Atendimento guiado", load: 55 },
  { hour: "14:00", label: "Fluxo de demonstração", load: 68 },
  { hour: "16:30", label: "Revisão do case", load: 31 },
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
  "O usuário conversa com o agente",
  "O agente coleta nome, WhatsApp, serviço, data e horário",
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

const initialChatForm: AppointmentForm = {
  ...initialForm,
  servico: "",
  horario: "",
};

const sampleAppointments: AppointmentRecord[] = [
  {
    id: "demo-001",
    nome: "Juliana Alves",
    whatsapp: "11988887777",
    servico: "Hidratação",
    data: "2026-05-15",
    horario: "15:00",
    observacoes: "Caso de uso demonstrativo para salão de beleza.",
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
  { label: "Início", path: "/", icon: Home },
  { label: "Agendar", path: "/agendar", icon: CalendarDays },
  { label: "Chat", path: "/chat", icon: MessageSquareText },
  { label: "Painel", path: "/painel", icon: PanelTop },
  { label: "Documentação", path: "/documentacao", icon: BookOpen },
  { label: "Integração Foundry", path: "/integracao-foundry", icon: Network },
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
      case "/chat":
        return <ChatPage />;
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

        <nav className="main-nav" aria-label="Navegação principal">
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
          Projeto desenvolvido por Rafael Risso, com inspiração e orientação do Professor Alexandre
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
            Case didático institucional
          </span>
          <h1>SENAI Agenda IA</h1>
          <p className="hero-subtitle">
            Um agente de agendamento conectado ao Microsoft Foundry, Supabase e Netlify.
          </p>
          <p className="hero-copy">
            Projeto didático desenvolvido para demonstrar como um agente de IA pode ir além da
            conversa: ele coleta dados do usuário, aciona uma API serverless e registra informações
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
              Ver documentação
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
          <span className="section-pill">Fluxo replicável</span>
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
          A diferença aqui é simples: este agente não apenas responde, ele executa uma ação real.
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
            <h1>Agendamento para salão de beleza</h1>
            <p>
              Este formulário simula os mesmos dados que o agente do Microsoft Foundry deve coletar
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
            <legend>Serviço</legend>
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
              <span>Horário</span>
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
            <span>Observações</span>
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
              <span className="slot-meter" aria-label={`${slot.load}% de ocupação`}>
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
            <li>O frontend chama somente a rota pública da Netlify.</li>
            <li>A Function valida o payload antes de gravar.</li>
            <li>A service role, quando usada, fica apenas no servidor.</li>
          </ul>
          <strong>Slot selecionado: {selectedSlot.hour}</strong>
        </div>
      </aside>
    </section>
  );
}

type ChatMessage = {
  role: "agent" | "user";
  text: string;
};

function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "agent",
      text:
        "Olá. Eu sou o SENAI Agenda IA. Pergunte se uma data e um horário estão disponíveis ou envie os dados para fechar um agendamento.",
    },
  ]);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState<AppointmentForm>(initialChatForm);
  const [availability, setAvailability] = useState<{
    data: string;
    horario: string;
    disponivel: boolean;
  } | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  async function handleChatSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text) {
      return;
    }

    setInput("");
    setIsWorking(true);
    setMessages((current) => [...current, { role: "user", text }]);

    try {
      const extracted = extractChatData(text, draft);
      const nextDraft = { ...draft, ...extracted };
      setDraft(nextDraft);

      const wantsBooking = /agend|fechar|confirm|marcar|reserv/i.test(text);
      const requestedAvailability = Boolean(extracted.data && extracted.horario) || /dispon/i.test(text);

      if (requestedAvailability && nextDraft.data && nextDraft.horario) {
        const response = await checkAvailability(nextDraft.data, nextDraft.horario);
        setAvailability({
          data: response.data,
          horario: response.horario,
          disponivel: response.disponivel,
        });

        if (!response.disponivel) {
          pushAgentMessage(response.message);
          return;
        }

        if (!wantsBooking) {
          pushAgentMessage(
            `${response.message} Se quiser fechar, envie nome, WhatsApp e serviço ou diga "pode agendar".`,
          );
          return;
        }
      }

      if (wantsBooking) {
        const missing = missingChatFields(nextDraft);
        if (missing.length > 0) {
          pushAgentMessage(`Para concluir o agendamento, ainda preciso de: ${missing.join(", ")}.`);
          return;
        }

        const response = await createAppointment(nextDraft);
        pushAgentMessage(`${response.message}. Protocolo: ${response.id.slice(0, 8)}.`);
        setDraft(initialChatForm);
        setAvailability(null);
        return;
      }

      pushAgentMessage(
        "Entendi. Para consultar disponibilidade, informe uma data e um horário. Para concluir, informe também nome, WhatsApp e serviço.",
      );
    } catch (requestError) {
      pushAgentMessage(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível processar a mensagem agora.",
      );
    } finally {
      setIsWorking(false);
    }
  }

  function pushAgentMessage(text: string) {
    setMessages((current) => [...current, { role: "agent", text }]);
  }

  function useExample(text: string) {
    setInput(text);
  }

  return (
    <section className="page-grid">
      <div className="chat-surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Chat demonstrativo</span>
            <h1>Agendamento pelo chat</h1>
            <p>
              Esta área simula o comportamento esperado do agente no Microsoft Foundry: consultar
              disponibilidade e, quando o usuário confirmar, registrar o agendamento.
            </p>
          </div>
          <MessageSquareText size={30} />
        </div>

        <div className="chat-window" aria-live="polite">
          {messages.map((message, index) => (
            <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
              {message.text}
            </div>
          ))}
          {isWorking ? (
            <div className="chat-message agent">
              <Loader2 className="spin" size={16} />
              Consultando ferramentas...
            </div>
          ) : null}
        </div>

        <form className="chat-form" onSubmit={handleChatSubmit}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ex.: 15/05/2026 às 14:00 está disponível?"
          />
          <button type="submit" disabled={isWorking}>
            <Send size={18} />
            Enviar
          </button>
        </form>
      </div>

      <aside className="agenda-surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Estado do chat</span>
            <h2>Dados coletados</h2>
          </div>
          <ShieldCheck size={26} />
        </div>

        <div className="key-list compact">
          <div>
            <code>nome</code>
            <span>{draft.nome || "pendente"}</span>
          </div>
          <div>
            <code>whatsapp</code>
            <span>{draft.whatsapp || "pendente"}</span>
          </div>
          <div>
            <code>serviço</code>
            <span>{draft.servico || "pendente"}</span>
          </div>
          <div>
            <code>data</code>
            <span>{draft.data || "pendente"}</span>
          </div>
          <div>
            <code>horário</code>
            <span>{draft.horario || "pendente"}</span>
          </div>
        </div>

        {availability ? (
          <p className={availability.disponivel ? "feedback success" : "feedback error"}>
            {availability.data} às {availability.horario}:{" "}
            {availability.disponivel ? "disponível" : "indisponível"}
          </p>
        ) : null}

        <div className="example-list">
          <button type="button" onClick={() => useExample("15/05/2026 às 14:00 está disponível?")}>
            Consultar disponibilidade
          </button>
          <button
            type="button"
            onClick={() =>
              useExample(
                "Pode agendar Rafael Risso, WhatsApp 11910950968, corte masculino, 15/05/2026 às 14:00",
              )
            }
          >
            Fechar agendamento
          </button>
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
              : "Não foi possível carregar os agendamentos reais.",
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
            Área de leitura para demonstrar que a conversa com o agente pode gerar registros reais
            no Supabase.
          </p>
        </div>
        <PanelTop size={32} />
      </div>

      <p className="feedback warning">
        Esta página está acessível no site por se tratar de um projeto pedagógico. Em um projeto
        real, somente o responsável teria acesso e ela poderia ser protegida por senha.
      </p>

      {notice ? (
        <p className="feedback warning">
          {notice} Exibindo registros de demonstração para a apresentação.
        </p>
      ) : null}

      <div className="metric-grid">
        <MetricCard label="Registros visíveis" value={appointments.length.toString()} />
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
                  {appointment.data} às {appointment.horario}
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
        kicker="Documentação"
        title="Documentação do Projeto"
        subtitle="Material de apoio para professores e alunos replicarem o SENAI Agenda IA em outras turmas."
      />

      <DocSection title="A. Visão geral">
        <p>
          O SENAI Agenda IA é um case didático de agente de IA com ação real. Ele conecta uma
          interface web, um agente criado no Microsoft Foundry, uma API serverless e uma base de
          dados Supabase.
        </p>
      </DocSection>

      <DocSection title="B. Objetivo pedagógico">
        <p>
          O objetivo é mostrar o ciclo completo: prompt do agente, interface web, API, banco de
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
            "Usuário",
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
            "Configurar variáveis de ambiente",
            "Criar Netlify Function",
            "Criar arquivo OpenAPI",
            "Publicar na Netlify",
            "Conectar a API ao agente",
            "Testar o fluxo completo",
          ]}
        />
      </DocSection>

      <DocSection title="F. Configuração do Supabase">
        <p>Estrutura didática da tabela <code>agendamentos</code>:</p>
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

      <DocSection title="G. Configuração da Netlify">
        <p>
          Configure as variáveis no painel da Netlify. A service role deve ser usada apenas nas
          Netlify Functions e nunca no frontend.
        </p>
        <KeyValueList
          items={[
            ["VITE_SUPABASE_URL", "Opcional para variantes que leem dados no frontend."],
            ["VITE_SUPABASE_ANON_KEY", "Opcional; nunca substitui validação server-side."],
            ["SUPABASE_URL", "URL do projeto Supabase usada pelas Functions."],
            ["SUPABASE_SERVICE_ROLE_KEY", "Chave server-side para painel e operações administrativas."],
          ]}
        />
      </DocSection>

      <DocSection title="H. Endpoints da API">
        <p><code>POST /api/consultar-disponibilidade</code></p>
        <CodeBlock
          code={`{
  "data": "2026-05-15",
  "horario": "14:00"
}`}
        />
        <CodeBlock
          code={`{
  "success": true,
  "disponivel": true,
  "message": "Horário disponível para agendamento.",
  "data": "2026-05-15",
  "horario": "14:00",
  "conflito": null
}`}
        />
        <p><code>POST /api/criar-agendamento</code></p>
        <CodeBlock
          code={`{
  "nome": "Juliana Alves",
  "whatsapp": "11988887777",
  "servico": "Hidratação",
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
          O agente deve coletar nome, WhatsApp, serviço, data e horário. Antes de agendar, ele
          consulta disponibilidade e, depois da confirmação do usuário, chama:
        </p>
        <CodeBlock code={`POST ${deployUrl}/api/criar-agendamento`} />
      </DocSection>

      <DocSection title="J. Prompt base do agente">
        <CodeBlock
          code={`Você é o assistente SENAI Agenda IA.
Seu papel é coletar dados de agendamento de forma clara, educada e objetiva.
Colete obrigatoriamente: nome, WhatsApp, serviço, data e horário.
Antes de agendar, chame consultarDisponibilidade.
Se o horário estiver disponível e o usuário confirmar, chame criarAgendamento.
Não peça chaves de API ao usuário.
Não mencione service role.
Quando todos os dados estiverem completos, chame a ferramenta correta.
Se algum dado estiver faltando, faça apenas a pergunta necessária.
Ao concluir, informe que o agendamento ficou com status pendente.`}
        />
      </DocSection>

      <DocSection title="K. Repositório">
        <a className="primary-link" href={repoUrl} target="_blank" rel="noreferrer">
          Ver repositório no GitHub
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
        kicker="Integração"
        title="Integração com Microsoft Foundry"
        subtitle="Este projeto foi preparado para receber dados de um agente criado no Microsoft Foundry."
      />

      <DocSection title="Fluxo da integração">
        <FlowList
          items={[
            "Microsoft Foundry Agent",
            "Ferramenta ou chamada HTTP",
            "Endpoint /api/consultar-disponibilidade",
            "Endpoint /api/criar-agendamento",
            "Netlify Function",
            "Supabase",
          ]}
        />
      </DocSection>

      <DocSection title="Arquivo OpenAPI">
        <p>
          O arquivo <code>openapi.yaml</code> descreve a API para o Foundry. A versão publicada está
          disponível em:
        </p>
        <a className="primary-link" href={openApiUrl} target="_blank" rel="noreferrer">
          {openApiUrl}
          <ExternalLink size={16} />
        </a>
        <CodeBlock
          code={`operationId: consultarDisponibilidade
endpoint: POST /api/consultar-disponibilidade
descrição: verifica se uma data e um horário estão livres

operationId: criarAgendamento
endpoint: POST /api/criar-agendamento
descrição: cria uma nova solicitação de agendamento no Supabase`}
        />
      </DocSection>

      <DocSection title="Teste manual da disponibilidade">
        <CodeBlock
          code={`fetch('/api/consultar-disponibilidade', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    data: '2026-05-15',
    horario: '14:00'
  })
})`}
        />
      </DocSection>

      <DocSection title="Teste manual do agendamento">
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
        subtitle="Projeto didático criado por Rafael Risso durante o curso MS FOUNDRY 2602."
      />

      <DocSection title="Origem do projeto">
        <p>
          O SENAI Agenda IA é um projeto didático criado por Rafael Risso durante o curso MS FOUNDRY
          2602, com inspiração e orientação do Professor Alexandre Becas Hernandes.
        </p>
        <p>
          A proposta é demonstrar, de maneira prática, como agentes de IA podem ser conectados a
          ferramentas reais, permitindo que uma conversa gere uma ação concreta, como registrar um
          agendamento em banco de dados.
        </p>
      </DocSection>

      <DocSection title="Por que este projeto importa?">
        <p>
          Muitos exemplos de IA ficam limitados a respostas em texto. Este projeto mostra uma
          aplicação mais próxima do mercado: um agente que entende a solicitação, organiza os dados,
          chama uma API e registra tudo em uma base real.
        </p>
      </DocSection>

      <DocSection title="Aplicações possíveis">
        <div className="application-grid">
          {[
            "Salões de beleza",
            "Barbearias",
            "Clínicas",
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

function extractChatData(text: string, current: AppointmentForm): Partial<AppointmentForm> {
  const lower = text.toLowerCase();
  const date = parseDateFromText(text);
  const time = text.match(/\b([01]?\d|2[0-3])[:h]([0-5]\d)\b/);
  const phone = text.replace(/\D/g, "").match(/\d{10,13}/)?.[0];
  const normalizedText = normalizeSearchText(text);
  const service = services.find((item) => normalizedText.includes(normalizeSearchText(item)));
  const named = text.match(/(?:nome\s*(?:é|:)?|sou|agendar\s+)([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][\wÀ-ÿ]+(?:\s+[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][\wÀ-ÿ]+){0,3})/);

  return {
    nome: named?.[1] ?? current.nome,
    whatsapp: phone ?? current.whatsapp,
    servico: service ?? current.servico,
    data: date ?? current.data,
    horario: time ? `${time[1].padStart(2, "0")}:${time[2]}` : current.horario,
    observacoes: current.observacoes,
  };
}

function parseDateFromText(text: string) {
  const isoDate = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/)?.[1];
  if (isoDate) {
    return isoDate;
  }

  const brazilianDate = text.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/);
  if (!brazilianDate) {
    return null;
  }

  const [, day, month, year] = brazilianDate;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function missingChatFields(form: AppointmentForm) {
  return [
    ["nome", form.nome],
    ["WhatsApp", form.whatsapp],
    ["serviço", form.servico],
    ["data", form.data],
    ["horário", form.horario],
  ]
    .filter(([, value]) => !value)
    .map(([label]) => label);
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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
