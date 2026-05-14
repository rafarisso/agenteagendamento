import type { Config } from "@netlify/functions";
import {
  AppointmentStatus,
  cleanString,
  corsHeaders,
  createSupabaseAdminClient,
  displayServiceName,
  json,
  normalizeOrigin,
} from "./_shared/schedule";

export const config: Config = {};

export default async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "GET") {
    return json({ error: "Método não permitido." }, 405);
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return json(
      {
        error:
          "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Netlify para carregar o painel.",
      },
      500,
    );
  }

  const { data, error } = await supabase
    .from("agendamentos")
    .select("id,nome,whatsapp,telefone,servico,data,horario,observacoes,mensagem,status,origem,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Erro ao listar agendamentos no Supabase", error);
    return json({ error: "Não foi possível carregar os agendamentos." }, 502);
  }

  return json({
    success: true,
    data: (data ?? []).map((item) => ({
      id: String(item.id),
      nome: String(item.nome),
      whatsapp: String(item.whatsapp ?? item.telefone ?? ""),
      servico: displayServiceName(String(item.servico)),
      data: String(item.data),
      horario: String(item.horario).slice(0, 5),
      observacoes: (item.observacoes ?? item.mensagem ?? null) as string | null,
      status: normalizeStatus(cleanString(item.status)) ?? "pendente",
      origem: normalizeOrigin(cleanString(item.origem)) ?? "manual",
      created_at: item.created_at as string | undefined,
      updated_at: item.updated_at as string | undefined,
    })),
  });
};

function normalizeStatus(value: string): AppointmentStatus | null {
  if (value === "pendente" || value === "confirmado" || value === "cancelado") {
    return value;
  }

  return null;
}
