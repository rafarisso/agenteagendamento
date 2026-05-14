import {
  BadgeCheck,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  FileCode2,
  GraduationCap,
  Home,
  Loader2,
  MessageSquareText,
  PanelTop,
  Phone,
  RefreshCcw,
  Send,
  ServerCog,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import {
  createAppointment,
  getDayAvailability,
  listAppointments,
  suggestAvailability,
} from "./lib/api";
import type {
  AppointmentForm,
  AppointmentRecord,
  AppointmentResponse,
} from "./types";

const repoUrl = "https://github.com/rafarisso/COLOQUE-O-NOME-DO-REPOSITORIO-AQUI";
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

const navItems = [
  { label: "Início", path: "/", icon: Home },
  { label: "Demonstração com Chat", path: "/chat", icon: MessageSquareText },
  { label: "Painel Didático", path: "/painel", icon: PanelTop },
  { label: "Documentação", path: "/documentacao", icon: BookOpen },
  { label: "Sobre o Projeto", path: "/sobre", icon: GraduationCap },
];

const initialManualForm: AppointmentForm = {
  nome: "",
  whatsapp: "",
  servico: "Hidratação",
  data: "",
  horario: "14:00",
  observacoes: "",
  email: "",
  origem: "manual",
};

type ChatDraft = AppointmentForm & {
  periodo: string;
  suggestedSlots: string[];
};

const initialChatDraft: ChatDraft = {
  nome: "",
  whatsapp: "",
  servico: "",
  data: "",
  horario: "",
  observacoes: "",
  email: "",
  origem: "chat",
  periodo: "",
  suggestedSlots: [],
};

type ChatMessage = {
  role: "agent" | "user";
  text: string;
};

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
      case "/chat":
        return <ChatPage navigate={navigate} />;
      case "/painel":
        return <PanelPage navigate={navigate} />;
      case "/documentacao":
      case "/integracao-foundry":
        return <DocumentationPage navigate={navigate} />;
      case "/simulador-api":
      case "/agendar":
        return <SimulatorPage />;
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
            <small>Laboratório didático</small>
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
        <p className="footer-full">
          Projeto desenvolvido por Rafael Risso, com inspiração e orientação do Professor Alexandre
          Becas Hernandes.
        </p>
        <strong className="footer-full">Curso MS FOUNDRY 2602 | SENAI | Maio de 2026</strong>
        <strong className="footer-short">Rafael Risso | Prof. Alexandre Becas Hernandes | SENAI | 2026</strong>
      </footer>
    </div>
  );
}

function HomePage({ navigate }: { navigate: (path: string) => void }) {
  return (
    <>
      <section className="hero-section focused-hero">
        <div className="hero-content">
          <span className="section-kicker">
            <Sparkles size={16} />
            MS FOUNDRY 2602 | SENAI
          </span>
          <h1>SENAI Agenda IA</h1>
          <p className="hero-subtitle">
            Laboratório didático de agente de agendamento com Microsoft Foundry e Supabase.
          </p>
          <p className="hero-copy">
            Um projeto desenvolvido para demonstrar como um agente de IA pode sair da conversa e
            executar uma ação real: consultar disponibilidade, sugerir horários, chamar uma API e
            registrar dados no Supabase.
          </p>

          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={() => navigate("/chat")}>
              <MessageSquareText size={18} />
              Testar demonstração com chat
            </button>
            <button className="secondary-button" type="button" onClick={() => navigate("/documentacao")}>
              <BookOpen size={18} />
              Ver documentação
            </button>
            <button className="ghost-button" type="button" onClick={() => navigate("/painel")}>
              <PanelTop size={18} />
              Ver painel didático
            </button>
          </div>
        </div>

        <div className="demo-console" aria-label="Prévia do fluxo conversacional">
          <div className="console-header">
            <Bot size={18} />
            <span>Agente conectado a ferramentas reais</span>
          </div>
          <div className="mini-chat">
            <p className="bubble user">Quero marcar uma hidratação sexta à tarde.</p>
            <p className="bubble agent">Encontrei 14:00, 15:30 e 16:30. Qual prefere?</p>
            <p className="bubble user">15h30. Pode ser Juliana Alves, 11988887777.</p>
            <p className="bubble agent">Agendamento registrado no Supabase e visível no painel.</p>
          </div>
        </div>
      </section>

      <section className="content-section" aria-labelledby="demonstrates-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">O que este projeto demonstra</span>
            <h2 id="demonstrates-title">De chatbot para agente operacional</h2>
          </div>
        </div>

        <div className="feature-grid">
          <InfoCard
            icon={MessageSquareText}
            title="Agente conversacional"
            text="O usuário conversa de forma natural, sem preencher formulários tradicionais."
          />
          <InfoCard
            icon={Clock3}
            title="Consulta de disponibilidade"
            text="O agente verifica datas e horários antes de sugerir opções."
          />
          <InfoCard
            icon={Database}
            title="Registro real no Supabase"
            text="A confirmação gera um registro real no banco de dados."
          />
          <InfoCard
            icon={GraduationCap}
            title="Arquitetura replicável"
            text="O projeto pode ser reproduzido por alunos em outras turmas."
          />
        </div>
      </section>

      <section className="content-section compact-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Fluxo da solução</span>
            <h2>Do pedido ao painel didático</h2>
          </div>
        </div>
        <FlowList
          items={[
            "Usuário",
            "Chat do agente",
            "Consulta de disponibilidade",
            "API Netlify Function",
            "Supabase",
            "Painel didático",
          ]}
        />
      </section>
    </>
  );
}

function ChatPage({ navigate }: { navigate: (path: string) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "agent",
      text:
        "Olá. Eu sou o SENAI Agenda IA. Diga o serviço, a data e o período desejado. Exemplo: Quero marcar uma hidratação sexta à tarde.",
    },
  ]);
  const [input, setInput] = useState("");
  const [draft, setDraft] = useState<ChatDraft>(initialChatDraft);
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
      let nextDraft: ChatDraft = {
        ...draft,
        ...extracted,
        suggestedSlots: extracted.suggestedSlots ?? draft.suggestedSlots,
      };

      const selectedByOrdinal = parseOrdinalSlot(text, draft.suggestedSlots);
      if (selectedByOrdinal) {
        nextDraft = { ...nextDraft, horario: selectedByOrdinal };
      }

      setDraft(nextDraft);

      if (!nextDraft.servico) {
        pushAgentMessage("Qual serviço deseja agendar? Neste case usamos salão de beleza apenas como cenário demonstrativo.");
        return;
      }

      if (!nextDraft.data) {
        pushAgentMessage("Para qual data? Você pode dizer algo como sexta, amanhã ou 15/05/2026.");
        return;
      }

      if (!nextDraft.horario) {
        if (!nextDraft.periodo) {
          pushAgentMessage("Qual período prefere: manhã ou tarde?");
          return;
        }

        const availability = await suggestAvailability(nextDraft.data, nextDraft.servico, nextDraft.periodo);
        nextDraft = { ...nextDraft, suggestedSlots: availability.horariosDisponiveis };
        setDraft(nextDraft);

        if (availability.horariosDisponiveis.length === 0) {
          pushAgentMessage(
            `${availability.mensagem} Escolha outra data ou outro período para eu consultar novamente.`,
          );
          return;
        }

        pushAgentMessage(
          `Para ${formatDate(nextDraft.data)}, encontrei horários às ${formatSlotList(
            availability.horariosDisponiveis,
          )}. Qual prefere?`,
        );
        return;
      }

      const selectedAvailability = await getDayAvailability(nextDraft.data);
      const selectedSlot = selectedAvailability.slots.find((slot) => slot.horario === nextDraft.horario);
      if (!selectedSlot?.disponivel) {
        const available = selectedAvailability.slots
          .filter((slot) => slot.disponivel)
          .map((slot) => slot.horario);
        setDraft({ ...nextDraft, horario: "", suggestedSlots: available });
        pushAgentMessage(
          available.length > 0
            ? `Esse horário não está disponível. Para essa data, posso sugerir ${formatSlotList(available)}.`
            : "Essa data não tem horários disponíveis. Escolha outra data para eu consultar.",
        );
        return;
      }

      const missing = missingChatFields(nextDraft);
      if (missing.length > 0) {
        pushAgentMessage(`Perfeito. Para registrar no Supabase, ainda preciso de: ${missing.join(", ")}.`);
        return;
      }

      const response = await createAppointment({
        ...nextDraft,
        origem: "chat",
        observacoes:
          nextDraft.observacoes ||
          `Agendamento criado pelo chat didático. Período solicitado: ${nextDraft.periodo || "não informado"}.`,
      });
      pushAgentMessage(
        `${response.message}. O registro já está disponível no painel didático conectado ao Supabase.`,
      );
      setDraft(initialChatDraft);
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
    <section className="page-grid chat-page-grid">
      <div className="chat-surface">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Experiência principal</span>
            <h1>Demonstração com Chat</h1>
            <p>Converse com o agente para consultar disponibilidade e registrar um agendamento.</p>
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
            placeholder="Ex.: Quero marcar uma hidratação sexta à tarde"
          />
          <button type="submit" disabled={isWorking}>
            <Send size={18} />
            Enviar
          </button>
        </form>
      </div>

      <aside className="agenda-surface learning-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Leitura didática</span>
            <h2>Estado da conversa</h2>
          </div>
          <ShieldCheck size={26} />
        </div>

        <KeyValueList
          compact
          items={[
            ["serviço", draft.servico || "pendente"],
            ["data", draft.data || "pendente"],
            ["período", draft.periodo || "pendente"],
            ["horário", draft.horario || "pendente"],
            ["nome", draft.nome || "pendente"],
            ["whatsapp", draft.whatsapp || "pendente"],
          ]}
        />

        <div className="didactic-note">
          <strong>O que está acontecendo</strong>
          <p>
            O chat coleta dados, consulta a Netlify Function, recebe horários livres e só cria o
            agendamento depois de ter confirmação e dados obrigatórios.
          </p>
        </div>

        <div className="example-list">
          <button type="button" onClick={() => useExample("Quero marcar uma hidratação sexta à tarde.")}>
            Exemplo: intenção
          </button>
          <button type="button" onClick={() => useExample("Prefiro 15h30.")}>
            Exemplo: escolha
          </button>
          <button type="button" onClick={() => useExample("Pode ser Juliana Alves, WhatsApp 11988887777.")}>
            Exemplo: dados finais
          </button>
          <button type="button" onClick={() => navigate("/painel")}>
            Abrir painel didático
          </button>
        </div>
      </aside>
    </section>
  );
}

function PanelPage({ navigate }: { navigate: (path: string) => void }) {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadAppointments() {
    setIsLoading(true);
    setNotice(null);
    try {
      const records = await listAppointments();
      setAppointments(records);
    } catch (requestError) {
      setNotice(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar os agendamentos reais.",
      );
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  const metrics = useMemo(() => {
    const byStatus = countBy(appointments, "status");
    const byOrigin = countBy(appointments, "origem");
    return { byStatus, byOrigin };
  }, [appointments]);

  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Painel Didático</span>
          <h1>Painel Didático</h1>
          <p>Visualização dos registros criados pelo agente no Supabase.</p>
        </div>
        <button className="secondary-button" type="button" onClick={loadAppointments} disabled={isLoading}>
          {isLoading ? <Loader2 className="spin" size={18} /> : <RefreshCcw size={18} />}
          Atualizar painel
        </button>
      </div>

      <p className="feedback warning">
        Este painel existe para fins pedagógicos. Ele mostra como a conversa com o agente gera
        registros reais no banco de dados. Em um projeto real, esta área seria protegida por login,
        senha e permissões de acesso.
      </p>

      {notice ? <p className="feedback error">{notice}</p> : null}

      <div className="metric-grid panel-metrics">
        <MetricCard label="Total" value={appointments.length.toString()} />
        <MetricCard label="Pendentes" value={(metrics.byStatus.pendente ?? 0).toString()} />
        <MetricCard label="Confirmados" value={(metrics.byStatus.confirmado ?? 0).toString()} />
        <MetricCard label="Cancelados" value={(metrics.byStatus.cancelado ?? 0).toString()} />
        <MetricCard
          label="Origem dos registros"
          value={`chat ${metrics.byOrigin.chat ?? 0} | foundry ${metrics.byOrigin.foundry ?? 0}`}
        />
      </div>

      <div className="table-card">
        <div className="table-header">
          <strong>Registros no Supabase</strong>
          {isLoading ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
        </div>

        {!isLoading && appointments.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum agendamento registrado ainda. Faça um teste pela demonstração com chat.</p>
            <button className="primary-button" type="button" onClick={() => navigate("/chat")}>
              Testar chat
            </button>
          </div>
        ) : (
          <div className="appointment-list">
            {appointments.map((appointment) => (
              <article className="appointment-row detailed" key={appointment.id}>
                <div>
                  <strong>{appointment.nome}</strong>
                  <span>{appointment.whatsapp}</span>
                </div>
                <div>
                  <strong>{appointment.servico}</strong>
                  <span>
                    {formatDate(appointment.data)} às {appointment.horario}
                  </span>
                </div>
                <span className={`status-badge ${appointment.status}`}>{appointment.status}</span>
                <span className={`origin-badge ${appointment.origem}`}>Origem: {appointment.origem}</span>
                <span>{appointment.created_at ? formatDateTime(appointment.created_at) : "sem data"}</span>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SimulatorPage() {
  const [form, setForm] = useState<AppointmentForm>(initialManualForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AppointmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateField<Key extends keyof AppointmentForm>(field: Key, value: AppointmentForm[Key]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await createAppointment({ ...form, origem: "manual" });
      setResult(response);
      setForm((current) => ({
        ...initialManualForm,
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
            <span className="eyebrow">Rota secundária</span>
            <h1>Simulador técnico de API</h1>
            <p>
              Área opcional para alunos testarem manualmente o endpoint de criação de agendamento.
            </p>
          </div>
          <FileCode2 size={30} />
        </div>

        <p className="feedback warning">
          Esta tela não representa a experiência principal do usuário. Ela existe apenas para fins
          didáticos, permitindo testar a API sem passar pelo chat.
        </p>

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
            <legend>Serviço do caso demonstrativo</legend>
            {services.slice(0, 4).map((service) => (
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
                  {["09:00", "10:30", "14:00", "15:30", "16:30"].map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
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
              placeholder="Envio direto para /api/criar-agendamento."
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
            {isSubmitting ? <Loader2 className="spin" size={20} /> : <ServerCog size={20} />}
            Enviar para a API
          </button>
        </form>
      </div>

      <aside className="agenda-surface">
        <span className="eyebrow">Endpoint testado</span>
        <h2>POST /api/criar-agendamento</h2>
        <p>
          O chat é a jornada principal. Este formulário simula o envio direto para a Function de
          criação, usando origem <code>manual</code>.
        </p>
        <CodeBlock
          code={`{
  "nome": "Juliana Alves",
  "whatsapp": "11988887777",
  "servico": "Hidratação",
  "data": "2026-05-15",
  "horario": "15:30",
  "origem": "manual"
}`}
        />
      </aside>
    </section>
  );
}

function DocumentationPage({ navigate }: { navigate: (path: string) => void }) {
  return (
    <article className="doc-page">
      <PageIntro
        kicker="Documentação"
        title="Documentação do Projeto"
        subtitle="Material de apoio para professores e alunos replicarem o SENAI Agenda IA em outras turmas."
      />

      <DocSection title="1. Visão geral">
        <p>
          O SENAI Agenda IA é um laboratório didático de agente de agendamento. A estrela do projeto
          é a conversa: o agente entende o pedido, consulta disponibilidade, sugere horários e
          registra o agendamento no Supabase.
        </p>
        <p>
          Caso de uso demonstrativo: agendamento para salão de beleza. A mesma lógica pode ser
          adaptada para clínicas, escolas, oficinas, consultorias, laboratórios, atendimento interno
          ou outros serviços.
        </p>
      </DocSection>

      <DocSection title="2. Objetivo pedagógico">
        <p>
          Este projeto foi criado para que alunos entendam o ciclo completo de um agente de IA
          conectado a ferramentas externas: prompt, chat, OpenAPI, Netlify Functions, Supabase,
          painel didático e deploy.
        </p>
      </DocSection>

      <DocSection title="3. Arquitetura">
        <FlowList
          items={[
            "Usuário",
            "Chat",
            "Agente Microsoft Foundry",
            "Ferramenta OpenAPI",
            "Netlify Function",
            "Supabase",
            "Painel Didático",
          ]}
        />
      </DocSection>

      <DocSection title="4. Jornada do usuário">
        <p>
          O usuário conversa de forma natural, recebe sugestões de horários disponíveis, escolhe uma
          opção, informa nome e WhatsApp e confirma o agendamento.
        </p>
      </DocSection>

      <DocSection title="5. Jornada técnica">
        <p>
          O agente coleta serviço, data e período, chama <code>consultarDisponibilidade</code>,
          sugere horários, coleta os dados obrigatórios e chama <code>criarAgendamento</code>. O
          painel lê os registros por uma Function server-side.
        </p>
      </DocSection>

      <DocSection title="6. Banco de dados Supabase">
        <div className="schema-grid">
          {[
            "id",
            "nome",
            "whatsapp",
            "email",
            "servico",
            "data",
            "horario",
            "observacoes",
            "status",
            "origem",
            "created_at",
            "updated_at",
          ].map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>
        <p>
          Status permitidos: <code>pendente</code>, <code>confirmado</code> e{" "}
          <code>cancelado</code>. Origens permitidas: <code>chat</code>, <code>manual</code>,{" "}
          <code>foundry</code> e <code>teste</code>.
        </p>
      </DocSection>

      <DocSection title="7. Netlify Functions">
        <KeyValueList
          items={[
            ["GET /api/disponibilidade", "Lista os horários livres e ocupados de uma data."],
            ["POST /api/consultar-disponibilidade", "Sugere horários por data, serviço e período."],
            ["POST /api/criar-agendamento", "Valida e cria o registro no Supabase."],
            ["GET /api/listar-agendamentos", "Alimenta o painel didático."],
          ]}
        />
      </DocSection>

      <DocSection title="8. Microsoft Foundry">
        <p>
          O Foundry deve importar o <code>openapi.yaml</code> como ferramenta. A ordem recomendada é:
          consultar disponibilidade, sugerir horários e criar agendamento somente após confirmação.
        </p>
      </DocSection>

      <DocSection title="9. OpenAPI">
        <p>
          Arquivo publicado: <a href={openApiUrl} target="_blank" rel="noreferrer">{openApiUrl}</a>
        </p>
        <CodeBlock
          code={`operationId: listarDisponibilidade
GET /api/disponibilidade

operationId: consultarDisponibilidade
POST /api/consultar-disponibilidade

operationId: criarAgendamento
POST /api/criar-agendamento`}
        />
      </DocSection>

      <DocSection title="10. Como replicar o projeto">
        <NumberedList
          items={[
            "Criar projeto no Supabase e executar o schema SQL.",
            "Configurar SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Netlify.",
            "Publicar o projeto React/Vite na Netlify.",
            "Importar o openapi.yaml no Microsoft Foundry.",
            "Configurar o prompt do agente.",
            "Testar a conversa completa e conferir o painel didático.",
          ]}
        />
      </DocSection>

      <DocSection title="11. Como publicar na Netlify">
        <CodeBlock code={`npm install
npm run build`} />
        <p>
          Build command: <code>npm run build</code>. Publish directory: <code>dist</code>.
        </p>
      </DocSection>

      <DocSection title="12. Como proteger em produção">
        <NumberedList
          items={[
            "Proteger o painel com autenticação.",
            "Usar RLS corretamente no Supabase.",
            "Não expor service role no frontend.",
            "Validar payload no servidor.",
            "Usar permissões por usuário.",
            "Usar domínio privado ou rota protegida para painel.",
          ]}
        />
      </DocSection>

      <DocSection title="13. Repositório GitHub">
        <p>
          O repositório contém o código-fonte, schema SQL, Netlify Functions, arquivo OpenAPI e
          instruções para replicação.
        </p>
        <a className="primary-link" href={repoUrl} target="_blank" rel="noreferrer">
          Ver código no GitHub
          <ExternalLink size={16} />
        </a>
      </DocSection>

      <DocSection title="14. Prompt recomendado para o agente">
        <CodeBlock
          code={`Você é o agente do projeto SENAI Agenda IA.
Converse naturalmente com o usuário.
Colete serviço, data e período desejado.
Consulte disponibilidade antes de confirmar qualquer agendamento.
Sugira apenas horários retornados pela API.
Depois que o usuário escolher um horário, colete nome e WhatsApp.
Crie o agendamento somente após confirmação do usuário.
Informe que o registro aparecerá no painel didático conectado ao Supabase.
Não invente disponibilidade.
Não confirme agendamento sem resposta da API.
Não peça nem mencione chaves de API, service role ou variáveis secretas.`}
        />
      </DocSection>

      <DocSection title="15. Ferramenta técnica opcional">
        <p>
          O formulário manual foi reposicionado como simulador de API. Ele não é a experiência
          principal do projeto.
        </p>
        <button className="secondary-button" type="button" onClick={() => navigate("/simulador-api")}>
          Abrir simulador técnico
        </button>
      </DocSection>

      <DocSection title="16. Créditos">
        <p>
          Desenvolvido por Rafael Risso, com inspiração e orientação do Professor Alexandre Becas
          Hernandes. Curso MS FOUNDRY 2602 | SENAI | Maio de 2026.
        </p>
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
        subtitle="Laboratório didático de agente de agendamento com Microsoft Foundry e Supabase."
      />

      <DocSection title="Origem do projeto">
        <p>
          O SENAI Agenda IA é um projeto didático desenvolvido por Rafael Risso durante o curso MS
          FOUNDRY 2602 do SENAI, com inspiração e orientação do Professor Alexandre Becas Hernandes.
        </p>
        <p>
          A proposta é demonstrar de forma prática como agentes criados no Microsoft Foundry podem
          ser conectados a APIs, banco de dados e interfaces web, transformando conversas em ações
          reais.
        </p>
      </DocSection>

      <DocSection title="Por que este projeto foi criado?">
        <p>
          O projeto nasceu como uma forma de explorar o potencial dos agentes de IA na educação
          técnica. Em vez de apresentar apenas um chatbot, a proposta foi criar uma solução completa,
          com interface, agente, API, banco de dados, documentação e deploy.
        </p>
      </DocSection>

      <DocSection title="Aplicações possíveis">
        <div className="application-grid">
          {[
            "Agendamento escolar",
            "Atendimento de secretaria",
            "Laboratórios",
            "Clínicas",
            "Barbearias",
            "Salões",
            "Consultorias",
            "Oficinas",
            "Suporte interno",
            "Pré-atendimento comercial",
          ].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </DocSection>

      <DocSection title="Créditos">
        <KeyValueList
          items={[
            ["Desenvolvido por", "Rafael Risso"],
            ["Orientação e inspiração", "Professor Alexandre Becas Hernandes"],
            ["Curso", "MS FOUNDRY 2602"],
            ["Instituição", "SENAI"],
            ["Data", "Maio de 2026"],
          ]}
        />
      </DocSection>
    </article>
  );
}

function InfoCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof MessageSquareText;
  title: string;
  text: string;
}) {
  return (
    <article className="info-card">
      <Icon size={24} />
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
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

function PageIntro({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
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
          {index < items.length - 1 ? <span className="flow-arrow">↓</span> : null}
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

function KeyValueList({
  items,
  compact = false,
}: {
  items: Array<[string, string]>;
  compact?: boolean;
}) {
  return (
    <div className={`key-list ${compact ? "compact" : ""}`}>
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

function extractChatData(text: string, current: ChatDraft): Partial<ChatDraft> {
  const normalizedText = normalizeSearchText(text);
  const time = parseTimeFromText(text);
  const phone = text.replace(/\D/g, "").match(/\d{10,13}/)?.[0];
  const service = services.find((item) => normalizedText.includes(normalizeSearchText(item)));
  const name = parseNameFromText(text);

  return {
    nome: name ?? current.nome,
    whatsapp: phone ?? current.whatsapp,
    servico: service ?? current.servico,
    data: parseDateFromText(text) ?? current.data,
    horario: time ?? current.horario,
    periodo: parsePeriodFromText(text) ?? current.periodo,
  };
}

function parseTimeFromText(text: string) {
  const match = text.match(/\b([01]?\d|2[0-3])(?::|h)([0-5]\d)?\b/);
  if (!match) {
    return null;
  }

  return `${match[1].padStart(2, "0")}:${match[2] ?? "00"}`;
}

function parsePeriodFromText(text: string) {
  const normalized = normalizeSearchText(text);
  if (normalized.includes("manha")) {
    return "manha";
  }
  if (normalized.includes("tarde")) {
    return "tarde";
  }
  if (normalized.includes("noite")) {
    return "noite";
  }
  return null;
}

function parseDateFromText(text: string) {
  const isoDate = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/)?.[1];
  if (isoDate) {
    return isoDate;
  }

  const brazilianDate = text.match(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/);
  if (brazilianDate) {
    const [, day, month, year] = brazilianDate;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const normalized = normalizeSearchText(text);
  const today = new Date();
  if (normalized.includes("hoje")) {
    return toDateInputValue(today);
  }
  if (normalized.includes("amanha")) {
    return toDateInputValue(addDays(today, 1));
  }

  const weekdays = [
    ["domingo", 0],
    ["segunda", 1],
    ["terca", 2],
    ["terça", 2],
    ["quarta", 3],
    ["quinta", 4],
    ["sexta", 5],
    ["sabado", 6],
    ["sábado", 6],
  ] as const;

  const found = weekdays.find(([label]) => normalized.includes(normalizeSearchText(label)));
  if (!found) {
    return null;
  }

  const target = found[1];
  const current = today.getDay();
  let diff = (target - current + 7) % 7;
  if (diff === 0 && !normalized.includes("hoje")) {
    diff = 7;
  }

  return toDateInputValue(addDays(today, diff));
}

function parseNameFromText(text: string) {
  const direct = text.match(
    /(?:nome\s*(?:é|:)?|sou|me chamo|pode ser|para)\s+([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][\wÀ-ÿ]+(?:\s+[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][\wÀ-ÿ]+){0,3})/,
  )?.[1];
  if (direct) {
    return direct.replace(/\s+WhatsApp.*$/i, "").trim();
  }

  if (/\d{10,13}/.test(text)) {
    return text.match(/\b([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][a-zà-ÿ]+(?:\s+[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][a-zà-ÿ]+){1,3})\b/)?.[1] ?? null;
  }

  return null;
}

function parseOrdinalSlot(text: string, slots: string[]) {
  const normalized = normalizeSearchText(text);
  if (normalized.includes("primeir")) {
    return slots[0] ?? null;
  }
  if (normalized.includes("segund")) {
    return slots[1] ?? null;
  }
  if (normalized.includes("terceir")) {
    return slots[2] ?? null;
  }
  return null;
}

function missingChatFields(form: ChatDraft) {
  return [
    ["nome", form.nome],
    ["WhatsApp", form.whatsapp],
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

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }
  return `${day}/${month}/${year}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatSlotList(slots: string[]) {
  if (slots.length <= 1) {
    return slots[0] ?? "nenhum horário";
  }
  return `${slots.slice(0, -1).join(", ")} e ${slots[slots.length - 1]}`;
}

function countBy<T extends Record<string, unknown>>(items: T[], key: keyof T) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = String(item[key]);
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
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
