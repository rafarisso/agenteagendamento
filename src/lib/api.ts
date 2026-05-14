import type {
  AppointmentForm,
  AppointmentRecord,
  AppointmentResponse,
  AvailabilityResponse,
  DayAvailabilityResponse,
  FoundryChatResponse,
} from "../types";

export async function createAppointment(form: AppointmentForm): Promise<AppointmentResponse> {
  const response = await fetch("/api/criar-agendamento", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nome: form.nome,
      whatsapp: form.whatsapp,
      telefone: form.whatsapp,
      email: form.email,
      servico: form.servico,
      data: form.data,
      horario: form.horario,
      observacoes: form.observacoes,
      mensagem: form.observacoes,
      origem: form.origem ?? "chat",
      metadata: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        submittedAt: new Date().toISOString(),
      },
    }),
  });

  const payload = (await response.json()) as Partial<AppointmentResponse> & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Não foi possível criar o agendamento.");
  }

  if (!payload.id || !payload.status || !payload.message) {
    throw new Error("Resposta inesperada da API de agendamento.");
  }

  return {
    id: payload.id,
    success: payload.success,
    status: payload.status,
    message: payload.message,
    data: payload.data,
  };
}

export async function listAppointments(): Promise<AppointmentRecord[]> {
  const response = await fetch("/api/listar-agendamentos");
  const payload = (await response.json()) as { data?: AppointmentRecord[]; error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Não foi possível carregar os agendamentos.");
  }

  return payload.data ?? [];
}

export async function getDayAvailability(data: string): Promise<DayAvailabilityResponse> {
  const response = await fetch(`/api/disponibilidade?data=${encodeURIComponent(data)}`);
  const payload = (await response.json()) as Partial<DayAvailabilityResponse> & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Não foi possível listar a disponibilidade.");
  }

  if (!payload.data || !Array.isArray(payload.slots)) {
    throw new Error("Resposta inesperada da API de disponibilidade.");
  }

  return {
    success: payload.success ?? true,
    data: payload.data,
    slots: payload.slots,
    mensagem: payload.mensagem ?? "Disponibilidade carregada.",
  };
}

export async function suggestAvailability(
  data: string,
  servico: string,
  periodo: string,
): Promise<AvailabilityResponse> {
  const response = await fetch("/api/consultar-disponibilidade", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data, servico, periodo }),
  });

  const payload = (await response.json()) as Partial<AvailabilityResponse> & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Não foi possível consultar a disponibilidade.");
  }

  if (!Array.isArray(payload.horariosDisponiveis) || !payload.data || !payload.mensagem) {
    throw new Error("Resposta inesperada da API de disponibilidade.");
  }

  return {
    success: payload.success ?? true,
    data: payload.data,
    servico: payload.servico ?? null,
    periodo: payload.periodo ?? periodo,
    horariosDisponiveis: payload.horariosDisponiveis,
    mensagem: payload.mensagem,
    disponivel: payload.disponivel,
  };
}

export async function sendFoundryChat(
  message: string,
  previousResponseId?: string | null,
  conversationId?: string | null,
): Promise<FoundryChatResponse> {
  const response = await fetch("/api/foundry-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      previousResponseId: previousResponseId || undefined,
      conversationId: conversationId || undefined,
    }),
  });

  const payload = (await response.json()) as Partial<FoundryChatResponse> & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Não foi possível conversar com o agente Foundry.");
  }

  if (!payload.reply) {
    throw new Error("Resposta inesperada do agente Foundry.");
  }

  return {
    success: payload.success ?? true,
    reply: payload.reply,
    responseId: payload.responseId ?? null,
    conversationId: payload.conversationId ?? null,
    outputTypes: payload.outputTypes ?? [],
    toolCalls: payload.toolCalls ?? [],
  };
}
