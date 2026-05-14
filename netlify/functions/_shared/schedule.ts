import { createClient } from "@supabase/supabase-js";

export type AppointmentOrigin = "chat" | "manual" | "foundry" | "teste";
export type AppointmentStatus = "pendente" | "confirmado" | "cancelado";

export type AppointmentRow = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string;
  whatsapp: string;
  servico: string;
  data: string;
  horario: string;
  mensagem: string | null;
  observacoes: string | null;
  status: AppointmentStatus;
  origem: AppointmentOrigin;
  metadata: Record<string, unknown>;
};

export const activeStatuses: AppointmentStatus[] = ["pendente", "confirmado"];

export const scheduleSlots = [
  { horario: "09:00", periodo: "manha" },
  { horario: "10:30", periodo: "manha" },
  { horario: "14:00", periodo: "tarde" },
  { horario: "15:30", periodo: "tarde" },
  { horario: "16:30", periodo: "tarde" },
];

export const serviceAliases = new Map([
  ["corte", "Corte masculino"],
  ["cortar", "Corte masculino"],
  ["cabelo", "Corte masculino"],
  ["cortar o cabelo", "Corte masculino"],
  ["corte de cabelo", "Corte masculino"],
  ["corte masculino", "Corte masculino"],
  ["hidratacao", "Hidratacao"],
  ["hidratar", "Hidratacao"],
  ["tratamento", "Hidratacao"],
  ["tratamento capilar", "Hidratacao"],
  ["hidratação", "Hidratacao"],
  ["escova", "Escova"],
  ["escovar", "Escova"],
  ["pintar", "Coloracao"],
  ["pintura", "Coloracao"],
  ["tintura", "Coloracao"],
  ["coloracao", "Coloracao"],
  ["coloração", "Coloracao"],
  ["diagnostico", "Diagnostico Foundry"],
  ["foundry", "Diagnostico Foundry"],
  ["diagnostico foundry", "Diagnostico Foundry"],
  ["diagnóstico foundry", "Diagnostico Foundry"],
  ["automacao", "Automacao com Agentes"],
  ["agentes", "Automacao com Agentes"],
  ["automacao com agentes", "Automacao com Agentes"],
  ["automação com agentes", "Automacao com Agentes"],
  ["integracao", "Integracao Supabase"],
  ["supabase", "Integracao Supabase"],
  ["integracao supabase", "Integracao Supabase"],
  ["integração supabase", "Integracao Supabase"],
  ["mentoria", "Mentoria tecnica"],
  ["mentoria tecnica", "Mentoria tecnica"],
  ["mentoria técnica", "Mentoria tecnica"],
]);

export const displayNames = new Map([
  ["Hidratacao", "Hidratação"],
  ["Coloracao", "Coloração"],
  ["Diagnostico Foundry", "Diagnóstico Foundry"],
  ["Automacao com Agentes", "Automação com Agentes"],
  ["Integracao Supabase", "Integração Supabase"],
  ["Mentoria tecnica", "Mentoria técnica"],
]);

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

export function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders,
  });
}

export function readEnv(name: string) {
  return globalThis.Netlify?.env?.get(name) ?? process.env[name];
}

export function createSupabaseAdminClient() {
  const supabaseUrl = readEnv("SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeLookupKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeService(value: string) {
  return serviceAliases.get(normalizeLookupKey(value)) ?? null;
}

export function displayServiceName(value: string) {
  return displayNames.get(value) ?? value;
}

export function normalizeOrigin(value: string): AppointmentOrigin | null {
  const key = normalizeLookupKey(value || "chat");
  if (key === "site") {
    return "manual";
  }

  if (key === "chat" || key === "manual" || key === "foundry" || key === "teste") {
    return key;
  }

  return null;
}

export function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00`));
}

export function getWeekday(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function isClosedDate(value: string) {
  const weekday = getWeekday(value);
  return weekday === 0 || weekday === 1;
}

export function normalizeTime(value: string) {
  const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  return match ? `${match[1]}:${match[2]}` : null;
}

export function isAllowedSlot(value: string) {
  return scheduleSlots.some((slot) => slot.horario === value);
}

export function slotsForPeriod(value: string) {
  const period = normalizeLookupKey(value);

  if (period === "manha" || period === "manhã") {
    return scheduleSlots.filter((slot) => slot.periodo === "manha");
  }

  if (period === "tarde") {
    return scheduleSlots.filter((slot) => slot.periodo === "tarde");
  }

  if (period === "noite") {
    return [];
  }

  return scheduleSlots;
}

export function normalizeMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}
