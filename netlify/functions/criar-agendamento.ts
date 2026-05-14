import { createClient } from "@supabase/supabase-js";
import type { Config } from "@netlify/functions";

type AppointmentPayload = {
  nome?: unknown;
  email?: unknown;
  telefone?: unknown;
  whatsapp?: unknown;
  servico?: unknown;
  data?: unknown;
  horario?: unknown;
  mensagem?: unknown;
  observacoes?: unknown;
  metadata?: unknown;
};

type AppointmentInsert = {
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
  origem: string;
  metadata: Record<string, unknown>;
};

const serviceAliases = new Map([
  ["Corte masculino", "Corte masculino"],
  ["corte masculino", "Corte masculino"],
  ["Hidratação", "Hidratacao"],
  ["Hidratacao", "Hidratacao"],
  ["hidratacao", "Hidratacao"],
  ["Escova", "Escova"],
  ["escova", "Escova"],
  ["Coloração", "Coloracao"],
  ["Coloracao", "Coloracao"],
  ["coloracao", "Coloracao"],
  ["Diagnóstico Foundry", "Diagnostico Foundry"],
  ["Diagnostico Foundry", "Diagnostico Foundry"],
  ["diagnostico foundry", "Diagnostico Foundry"],
  ["Automação com Agentes", "Automacao com Agentes"],
  ["Automacao com Agentes", "Automacao com Agentes"],
  ["automacao com agentes", "Automacao com Agentes"],
  ["Integração Supabase", "Integracao Supabase"],
  ["Integracao Supabase", "Integracao Supabase"],
  ["integracao supabase", "Integracao Supabase"],
  ["Mentoria técnica", "Mentoria tecnica"],
  ["Mentoria tecnica", "Mentoria tecnica"],
  ["mentoria tecnica", "Mentoria tecnica"],
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

export const config: Config = {};

export default async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Método não permitido." }, 405);
  }

  const supabaseUrl = readEnv("SUPABASE_URL");
  const supabaseKey =
    readEnv("SUPABASE_SERVICE_ROLE_KEY") ??
    readEnv("SUPABASE_PUBLISHABLE_KEY") ??
    readEnv("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseKey) {
    return json(
      { error: "Configure SUPABASE_URL e uma chave Supabase server-side na Netlify." },
      500,
    );
  }

  let payload: AppointmentPayload;
  try {
    payload = (await request.json()) as AppointmentPayload;
  } catch {
    return json({ error: "Envie um corpo JSON válido." }, 400);
  }

  const parsed = parsePayload(payload);
  if (!parsed.ok) {
    return json({ error: parsed.error }, 400);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error } = await supabase.from("agendamentos").insert(parsed.value);

  if (error) {
    console.error("Erro ao criar agendamento no Supabase", error);
    if (error.code === "23505") {
      return json({ error: "Este horário já está reservado." }, 409);
    }

    return json({ error: "Não foi possível salvar o agendamento." }, 502);
  }

  return json(
    {
      success: true,
      id: parsed.value.id,
      status: "pendente",
      message: "Agendamento registrado com sucesso",
      data: {
        id: parsed.value.id,
        nome: parsed.value.nome,
        whatsapp: parsed.value.whatsapp,
        servico: displayServiceName(parsed.value.servico),
        data: parsed.value.data,
        horario: parsed.value.horario,
        observacoes: parsed.value.observacoes,
        status: "pendente",
      },
    },
    201,
  );
};

function readEnv(name: string) {
  return globalThis.Netlify?.env?.get(name) ?? process.env[name];
}

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders,
  });
}

function parsePayload(payload: AppointmentPayload):
  | { ok: true; value: AppointmentInsert }
  | { ok: false; error: string } {
  const id = crypto.randomUUID();
  const nome = cleanString(payload.nome);
  const email = cleanString(payload.email);
  const whatsapp = cleanString(payload.whatsapp) || cleanString(payload.telefone);
  const servico = cleanString(payload.servico);
  const data = cleanString(payload.data);
  const horario = cleanString(payload.horario);
  const observacoes = cleanString(payload.observacoes) || cleanString(payload.mensagem);

  if (!nome || nome.length < 3) {
    return { ok: false, error: "Informe um nome com pelo menos 3 caracteres." };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Informe um email válido." };
  }

  if (!whatsapp || whatsapp.length < 8) {
    return { ok: false, error: "Informe um WhatsApp válido." };
  }

  const normalizedService = serviceAliases.get(servico) ?? serviceAliases.get(normalizeLookupKey(servico));

  if (!normalizedService) {
    return { ok: false, error: "Escolha um serviço válido." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(Date.parse(`${data}T00:00:00`))) {
    return { ok: false, error: "Informe uma data válida no formato AAAA-MM-DD." };
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)) {
    return { ok: false, error: "Informe um horário válido no formato HH:MM." };
  }

  return {
    ok: true,
    value: {
      id,
      nome,
      email: email || null,
      telefone: whatsapp,
      whatsapp,
      servico: normalizedService,
      data,
      horario,
      mensagem: observacoes || null,
      observacoes: observacoes || null,
      origem: "site",
      metadata: normalizeMetadata(payload.metadata),
    },
  };
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeLookupKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function displayServiceName(value: string) {
  const displayNames = new Map([
    ["Hidratacao", "Hidratação"],
    ["Coloracao", "Coloração"],
    ["Diagnostico Foundry", "Diagnóstico Foundry"],
    ["Automacao com Agentes", "Automação com Agentes"],
    ["Integracao Supabase", "Integração Supabase"],
    ["Mentoria tecnica", "Mentoria técnica"],
  ]);

  return displayNames.get(value) ?? value;
}

function normalizeMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}
