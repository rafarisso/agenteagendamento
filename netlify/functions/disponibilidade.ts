import type { Config } from "@netlify/functions";
import {
  activeStatuses,
  cleanString,
  corsHeaders,
  createSupabaseAdminClient,
  isClosedDate,
  isValidDate,
  json,
  scheduleSlots,
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
          "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Netlify para listar disponibilidade.",
      },
      500,
    );
  }

  const url = new URL(request.url);
  const data = cleanString(url.searchParams.get("data"));

  if (!isValidDate(data)) {
    return json({ error: "Informe uma data válida no formato AAAA-MM-DD." }, 400);
  }

  const { data: registros, error } = await supabase
    .from("agendamentos")
    .select("horario,status")
    .eq("data", data)
    .in("status", activeStatuses);

  if (error) {
    console.error("Erro ao listar disponibilidade no Supabase", error);
    return json({ error: "Não foi possível listar a disponibilidade." }, 502);
  }

  const closed = isClosedDate(data);
  const occupied = new Set((registros ?? []).map((item) => String(item.horario).slice(0, 5)));
  const slots = scheduleSlots.map((slot) => ({
    horario: slot.horario,
    periodo: slot.periodo,
    disponivel: !closed && !occupied.has(slot.horario),
  }));

  return json({
    success: true,
    data,
    slots,
    mensagem: closed
      ? "Não há atendimento aos domingos e segundas-feiras."
      : "Disponibilidade carregada com sucesso.",
  });
};
