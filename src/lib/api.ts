import type {
  AppointmentForm,
  AppointmentRecord,
  AppointmentResponse,
  AvailabilityResponse,
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

export async function checkAvailability(data: string, horario: string): Promise<AvailabilityResponse> {
  const response = await fetch("/api/consultar-disponibilidade", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data, horario }),
  });

  const payload = (await response.json()) as Partial<AvailabilityResponse> & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Não foi possível consultar a disponibilidade.");
  }

  if (typeof payload.disponivel !== "boolean" || !payload.data || !payload.horario || !payload.message) {
    throw new Error("Resposta inesperada da API de disponibilidade.");
  }

  return {
    success: payload.success ?? true,
    disponivel: payload.disponivel,
    message: payload.message,
    data: payload.data,
    horario: payload.horario,
    conflito: payload.conflito ?? null,
  };
}
