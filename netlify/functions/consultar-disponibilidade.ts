import type { Config } from "@netlify/functions";
import {
  activeStatuses,
  cleanString,
  corsHeaders,
  createSupabaseAdminClient,
  displayServiceName,
  isAllowedSlot,
  isClosedDate,
  isValidDate,
  json,
  normalizeService,
  normalizeTime,
  slotsForPeriod,
} from "./_shared/schedule";

type AvailabilityPayload = {
  data?: unknown;
  servico?: unknown;
  periodo?: unknown;
  horario?: unknown;
};

export const config: Config = {};

export default async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Método não permitido." }, 405);
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
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
  const servico = cleanString(payload.servico);
  const periodo = cleanString(payload.periodo);
  const horario = cleanString(payload.horario);
  const normalizedService = servico ? normalizeService(servico) : null;
  const normalizedTime = horario ? normalizeTime(horario) : null;

  if (!isValidDate(data)) {
    return json({ error: "Informe uma data válida no formato AAAA-MM-DD." }, 400);
  }

  if (servico && !normalizedService) {
    return json({ error: "Informe um serviço válido." }, 400);
  }

  if (horario && (!normalizedTime || !isAllowedSlot(normalizedTime))) {
    return json({ error: "Informe um horário disponível na agenda didática." }, 400);
  }

  const candidateSlots = normalizedTime
    ? [{ horario: normalizedTime, periodo: "consulta" }]
    : slotsForPeriod(periodo);

  if (isClosedDate(data)) {
    return json({
      success: true,
      data,
      servico: normalizedService ? displayServiceName(normalizedService) : null,
      periodo: periodo || "todos",
      horariosDisponiveis: [],
      mensagem: "Não há atendimento aos domingos e segundas-feiras.",
      disponivel: normalizedTime ? false : undefined,
    });
  }

  const { data: registros, error } = await supabase
    .from("agendamentos")
    .select("horario,status")
    .eq("data", data)
    .in("status", activeStatuses);

  if (error) {
    console.error("Erro ao consultar disponibilidade no Supabase", error);
    return json({ error: "Não foi possível consultar a disponibilidade." }, 502);
  }

  const occupied = new Set((registros ?? []).map((item) => String(item.horario).slice(0, 5)));
  const horariosDisponiveis = candidateSlots
    .map((slot) => slot.horario)
    .filter((slot) => !occupied.has(slot));
  const disponivel = normalizedTime ? horariosDisponiveis.includes(normalizedTime) : undefined;

  return json({
    success: true,
    data,
    servico: normalizedService ? displayServiceName(normalizedService) : null,
    periodo: periodo || "todos",
    horariosDisponiveis,
    mensagem:
      horariosDisponiveis.length > 0
        ? `Encontrei ${horariosDisponiveis.length} horário${horariosDisponiveis.length === 1 ? "" : "s"} disponível${horariosDisponiveis.length === 1 ? "" : "is"} para esse período.`
        : "Não encontrei horários disponíveis para esse período.",
    disponivel,
  });
};
