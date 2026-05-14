export type AppointmentForm = {
  nome: string;
  email: string;
  telefone: string;
  servico: string;
  data: string;
  horario: string;
  mensagem: string;
};

export type AppointmentResponse = {
  id: string;
  status: "pendente" | "confirmado" | "cancelado" | "concluido";
  message: string;
};
