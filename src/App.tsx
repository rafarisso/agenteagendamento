import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  Loader2,
  Mail,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { createAppointment } from "./lib/api";
import type { AppointmentForm, AppointmentResponse } from "./types";

const services = [
  "Diagnostico Foundry",
  "Automacao com Agentes",
  "Integracao Supabase",
  "Mentoria tecnica",
];

const slots = [
  { hour: "09:00", label: "Inicio comercial", load: 42 },
  { hour: "11:30", label: "Janela consultiva", load: 55 },
  { hour: "14:00", label: "Projetos e arquitetura", load: 68 },
  { hour: "16:30", label: "Revisao executiva", load: 31 },
];

const initialForm: AppointmentForm = {
  nome: "",
  email: "",
  telefone: "",
  servico: services[0],
  data: "",
  horario: "09:00",
  mensagem: "",
};

function App() {
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
      setForm((current) => ({ ...initialForm, servico: current.servico, horario: current.horario }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Erro inesperado no envio.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="side-rail" aria-label="Resumo operacional">
        <div className="brand-mark" aria-hidden="true">
          AF
        </div>
        <nav className="rail-nav" aria-label="Navegacao do painel">
          <a href="#agenda" className="rail-link active" aria-label="Agenda">
            <CalendarDays size={20} />
          </a>
          <a href="#formulario" className="rail-link" aria-label="Formulario">
            <MessageSquareText size={20} />
          </a>
          <a href="#seguranca" className="rail-link" aria-label="Seguranca">
            <ShieldCheck size={20} />
          </a>
        </nav>
        <div className="rail-status">
          <span className="status-dot" />
          <span>Online</span>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Microsoft Foundry + Netlify + Supabase</p>
            <h1>Central de Agendamentos</h1>
          </div>
          <div className="topbar-actions">
            <span className="secure-badge">
              <ShieldCheck size={18} />
              Function server-side
            </span>
          </div>
        </header>

        <section className="overview-band" aria-label="Visao geral">
          <div className="overview-copy">
            <span className="section-kicker">
              <Sparkles size={16} />
              Fluxo pronto para deploy
            </span>
            <h2>Agende consultorias e envie os dados com seguranca para o Supabase.</h2>
            <p>
              O front-end conversa com a rota publica da Netlify; a chave de service role fica
              isolada na Function.
            </p>
          </div>
          <div className="signal-grid" aria-label="Indicadores">
            <div>
              <strong>4</strong>
              <span>servicos</span>
            </div>
            <div>
              <strong>{selectedSlot.load}%</strong>
              <span>ocupacao</span>
            </div>
            <div>
              <strong>API</strong>
              <span>Foundry ready</span>
            </div>
          </div>
        </section>

        <div className="workflow-grid">
          <section className="form-surface" id="formulario" aria-labelledby="form-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Novo registro</p>
                <h2 id="form-title">Dados do agendamento</h2>
              </div>
              <CalendarDays size={26} />
            </div>

            <form className="appointment-form" onSubmit={handleSubmit}>
              <label>
                <span>Nome completo</span>
                <div className="input-wrap">
                  <UserRound size={18} />
                  <input
                    value={form.nome}
                    onChange={(event) => updateField("nome", event.target.value)}
                    placeholder="Rafael Risso"
                    autoComplete="name"
                    required
                  />
                </div>
              </label>

              <div className="field-grid">
                <label>
                  <span>Email</span>
                  <div className="input-wrap">
                    <Mail size={18} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      placeholder="contato@email.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>
                <label>
                  <span>Telefone</span>
                  <div className="input-wrap">
                    <Phone size={18} />
                    <input
                      value={form.telefone}
                      onChange={(event) => updateField("telefone", event.target.value)}
                      placeholder="(11) 99999-9999"
                      autoComplete="tel"
                      required
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
                <span>Contexto</span>
                <textarea
                  value={form.mensagem}
                  onChange={(event) => updateField("mensagem", event.target.value)}
                  placeholder="Objetivo da conversa, escopo inicial ou principal duvida."
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
          </section>

          <section className="agenda-surface" id="agenda" aria-labelledby="agenda-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Disponibilidade</p>
                <h2 id="agenda-title">Janelas do dia</h2>
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

            <div className="security-panel" id="seguranca">
              <div>
                <ShieldCheck size={24} />
                <h3>Arquitetura segura</h3>
              </div>
              <ul>
                <li>Service role somente em variavel server-side da Netlify.</li>
                <li>RLS habilitado no schema do Supabase.</li>
                <li>OpenAPI simples para uso como ferramenta no Foundry.</li>
              </ul>
            </div>
          </section>
        </div>

        <footer className="app-footer">
          Desenvolvido por Rafael Risso | Curso de Microsoft Foundry | Maio 2026
        </footer>
      </main>
    </div>
  );
}

export default App;
