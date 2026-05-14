import { createClient } from "@supabase/supabase-js";
import type { Config } from "@netlify/functions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

export const config: Config = {};

export default async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "GET") {
    return json({ error: "Método não permitido." }, 405);
  }

  const supabaseUrl = readEnv("SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json(
      {
        error:
          "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Netlify para carregar o painel.",
      },
      500,
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await supabase
    .from("agendamentos")
    .select("id,nome,whatsapp,telefone,servico,data,horario,observacoes,mensagem,status,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Erro ao listar agendamentos no Supabase", error);
    return json({ error: "Não foi possível carregar os agendamentos." }, 502);
  }

  return json(
    {
      success: true,
      data: (data ?? []).map((item) => ({
        id: String(item.id),
        nome: String(item.nome),
        whatsapp: String(item.whatsapp ?? item.telefone ?? ""),
        servico: displayServiceName(String(item.servico)),
        data: String(item.data),
        horario: String(item.horario).slice(0, 5),
        observacoes: (item.observacoes ?? item.mensagem ?? null) as string | null,
        status: item.status as string,
        created_at: item.created_at as string | undefined,
        updated_at: item.updated_at as string | undefined,
      })),
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
