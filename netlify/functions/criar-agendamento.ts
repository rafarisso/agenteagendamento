import { createClient } from "@supabase/supabase-js";
import type { Config } from "@netlify/functions";

type AppointmentPayload = {
  nome?: unknown;
  email?: unknown;
  telefone?: unknown;
  servico?: unknown;
  data?: unknown;
  horario?: unknown;
  mensagem?: unknown;
  metadata?: unknown;
};

type AppointmentInsert = {
  nome: string;
  email: string;
  telefone: string;
  servico: string;
  data: string;
  horario: string;
  mensagem: string | null;
  origem: string;
  metadata: Record<string, unknown>;
};

const allowedServices = new Set([
  "Diagnostico Foundry",
  "Automacao com Agentes",
  "Integracao Supabase",
  "Mentoria tecnica",
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
    return json({ error: "Metodo nao permitido." }, 405);
  }

  const supabaseUrl = readEnv("SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Netlify." }, 500);
  }

  let payload: AppointmentPayload;
  try {
    payload = (await request.json()) as AppointmentPayload;
  } catch {
    return json({ error: "Envie um corpo JSON valido." }, 400);
  }

  const parsed = parsePayload(payload);
  if (!parsed.ok) {
    return json({ error: parsed.error }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from("agendamentos")
    .insert(parsed.value)
    .select("id,status,created_at")
    .single();

  if (error) {
    console.error("Erro ao criar agendamento no Supabase", error);
    if (error.code === "23505") {
      return json({ error: "Este horario ja esta reservado." }, 409);
    }

    return json({ error: "Nao foi possivel salvar o agendamento." }, 502);
  }

  return json(
    {
      id: data.id as string,
      status: data.status as string,
      message: "Agendamento recebido com sucesso.",
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
  const nome = cleanString(payload.nome);
  const email = cleanString(payload.email);
  const telefone = cleanString(payload.telefone);
  const servico = cleanString(payload.servico);
  const data = cleanString(payload.data);
  const horario = cleanString(payload.horario);
  const mensagem = cleanString(payload.mensagem);

  if (!nome || nome.length < 3) {
    return { ok: false, error: "Informe um nome com pelo menos 3 caracteres." };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Informe um email valido." };
  }

  if (!telefone || telefone.length < 8) {
    return { ok: false, error: "Informe um telefone valido." };
  }

  if (!servico || !allowedServices.has(servico)) {
    return { ok: false, error: "Escolha um servico valido." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(Date.parse(`${data}T00:00:00`))) {
    return { ok: false, error: "Informe uma data valida no formato AAAA-MM-DD." };
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)) {
    return { ok: false, error: "Informe um horario valido no formato HH:MM." };
  }

  return {
    ok: true,
    value: {
      nome,
      email,
      telefone,
      servico,
      data,
      horario,
      mensagem: mensagem || null,
      origem: "site",
      metadata: normalizeMetadata(payload.metadata),
    },
  };
}

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}
