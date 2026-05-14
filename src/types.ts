export type AppointmentOrigin = "chat" | "manual" | "foundry" | "teste";
export type AppointmentStatus = "pendente" | "confirmado" | "cancelado";

export type AppointmentForm = {
  nome: string;
  whatsapp: string;
  servico: string;
  data: string;
  horario: string;
  observacoes: string;
  email?: string;
  origem?: AppointmentOrigin;
};

export type AppointmentResponse = {
  id: string;
  success?: boolean;
  status: AppointmentStatus;
  message: string;
  data?: AppointmentRecord;
};

export type AppointmentRecord = {
  id: string;
  nome: string;
  whatsapp: string;
  servico: string;
  data: string;
  horario: string;
  observacoes: string | null;
  status: AppointmentStatus;
  origem: AppointmentOrigin;
  created_at?: string;
  updated_at?: string;
};

export type DaySlot = {
  horario: string;
  periodo: "manha" | "tarde";
  disponivel: boolean;
};

export type DayAvailabilityResponse = {
  success: boolean;
  data: string;
  slots: DaySlot[];
  mensagem: string;
};

export type AvailabilityResponse = {
  success: boolean;
  data: string;
  servico: string | null;
  periodo: string;
  horariosDisponiveis: string[];
  mensagem: string;
  disponivel?: boolean;
};
