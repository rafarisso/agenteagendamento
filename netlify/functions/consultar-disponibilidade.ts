import { createClient } from "@supabase/supabase-js";
import type { Config } from "@netlify/functions";

type AvailabilityPayload = {
  data?: unknown;
  horario?: unknown;
};

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
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json(
      {
        error:
          "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Netlify para consultar disponibilidade.",
      },
      500,
    );
  }

  let payload: AvailabilityPayload;
  try {
    payload = (await request.json()) as AvailabilityPayload;
  } catch {
    return json({ error: "Envie um corpo JSON válido." }, 400);
  }

  const data = cleanString(payload.data);
  const horario = cleanString(payload.horario);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || Number.isNaN(Date.parse(`${data}T00:00:00`))) {
    return json({ error: "Informe uma data válida no formato AAAA-MM-DD." }, 400);
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)) {
    return json({ error: "Informe um horário válido no formato HH:MM." }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: registros, error } = await supabase
    .from("agendamentos")
    .select("id,status,servico")
    .eq("data", data)
    .eq("horario", horario)
    .in("status", ["pendente", "confirmado"])
    .limit(1);

  if (error) {
    console.error("Erro ao consultar disponibilidade no Supabase", error);
    return json({ error: "Não foi possível consultar a disponibilidade." }, 502);
  }

  const conflito = registros?.[0] ?? null;
  const disponivel = !conflito;

  return json(
    {
      success: true,
      disponivel,
      data,
      horario,
      message: disponivel
        ? "Horário disponível para agendamento."
        : "Horário indisponível. Já existe agendamento pendente ou confirmado.",
      conflito: conflito
        ? {
            status: conflito.status as string,
            servico: displayServiceName(String(conflito.servico ?? "")),
          }
        : null,
    },
    200,
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

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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
