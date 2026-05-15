import type { Config } from "@netlify/functions";
import {
  AppointmentRow,
  activeStatuses,
  cleanString,
  corsHeaders,
  createSupabaseAdminClient,
  displayServiceName,
  isAllowedSlot,
  isClosedDate,
  isValidDate,
  json,
  normalizeMetadata,
  normalizeOrigin,
  normalizeService,
  normalizeTime,
} from "./_shared/schedule";

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
  origem?: unknown;
  metadata?: unknown;
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
      { error: "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Netlify." },
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

  const { data: conflitos, error: conflictError } = await supabase
    .from("agendamentos")
    .select("id,status")
    .eq("data", parsed.value.data)
    .eq("horario", parsed.value.horario)
    .in("status", activeStatuses)
    .limit(1);

  if (conflictError) {
    console.error("Erro ao validar conflito de agenda no Supabase", conflictError);
    return json({ error: "Não foi possível validar a disponibilidade." }, 502);
  }

  if ((conflitos ?? []).length > 0) {
    return json({ error: "Este horário já está reservado." }, 409);
  }

  const { error } = await supabase.from("agendamentos").insert(parsed.value);

  if (error) {
    console.error("Erro ao criar agendamento no Supabase", error);
    if (error.code === "23505") {
      return json({ error: "Este horário já está reservado." }, 409);
    }

    if (error.code === "23514") {
      return json({
        success: false,
        status: "erro_schema",
        message:
          "O banco de dados ainda não aceita este serviço. Execute a atualização do schema SQL no Supabase e tente novamente.",
      });
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
        origem: parsed.value.origem,
      },
    },
    201,
  );
};

function parsePayload(payload: AppointmentPayload):
  | { ok: true; value: AppointmentRow }
  | { ok: false; error: string } {
  const id = crypto.randomUUID();
  const nome = cleanString(payload.nome);
  const email = cleanString(payload.email);
  const whatsapp = cleanString(payload.whatsapp) || cleanString(payload.telefone);
  const servico = normalizeService(cleanString(payload.servico));
  const data = cleanString(payload.data);
  const horario = normalizeTime(cleanString(payload.horario));
  const observacoes = cleanString(payload.observacoes) || cleanString(payload.mensagem);
  const origem = normalizeOrigin(cleanString(payload.origem) || "chat");

  if (!nome || nome.length < 3) {
    return { ok: false, error: "Informe um nome com pelo menos 3 caracteres." };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Informe um email válido." };
  }

  if (!whatsapp || whatsapp.replace(/\D/g, "").length < 8) {
    return { ok: false, error: "Informe um WhatsApp válido." };
  }

  if (!servico) {
    return { ok: false, error: "Escolha um serviço válido." };
  }

  if (!isValidDate(data)) {
    return { ok: false, error: "Informe uma data válida no formato AAAA-MM-DD." };
  }

  if (isClosedDate(data)) {
    return { ok: false, error: "Não há atendimento aos domingos e segundas-feiras." };
  }

  if (!horario || !isAllowedSlot(horario)) {
    return { ok: false, error: "Informe um horário disponível na agenda didática." };
  }

  if (!origem) {
    return { ok: false, error: "Informe uma origem válida: chat, manual, foundry ou teste." };
  }

  return {
    ok: true,
    value: {
      id,
      nome,
      email: email || null,
      telefone: whatsapp,
      whatsapp,
      servico,
      data,
      horario,
      mensagem: observacoes || null,
      observacoes: observacoes || null,
      status: "pendente",
      origem,
      metadata: normalizeMetadata(payload.metadata),
    },
  };
}
