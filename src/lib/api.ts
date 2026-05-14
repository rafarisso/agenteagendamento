import type { AppointmentForm, AppointmentResponse } from "../types";

export async function createAppointment(form: AppointmentForm): Promise<AppointmentResponse> {
  const response = await fetch("/api/criar-agendamento", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...form,
      metadata: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        submittedAt: new Date().toISOString(),
      },
    }),
  });

  const payload = (await response.json()) as Partial<AppointmentResponse> & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Nao foi possivel criar o agendamento.");
  }

  if (!payload.id || !payload.status || !payload.message) {
    throw new Error("Resposta inesperada da API de agendamento.");
  }

  return {
    id: payload.id,
    status: payload.status,
    message: payload.message,
  };
}
