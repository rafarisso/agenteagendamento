export type AppointmentForm = {
  nome: string;
  whatsapp: string;
  servico: string;
  data: string;
  horario: string;
  observacoes: string;
  email?: string;
};

export type AppointmentResponse = {
  id: string;
  success?: boolean;
  status: "pendente" | "confirmado" | "cancelado" | "concluido";
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
  status: "pendente" | "confirmado" | "cancelado" | "concluido";
  created_at?: string;
  updated_at?: string;
};
