import { z } from "zod";

export const createVacationRequestSchema = z.object({
  colaboradorId: z.string().min(1, "Colaborador é obrigatório"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataFim: z.string().min(1, "Data de fim é obrigatória"),
  totalDias: z.number().min(1, "Total de dias deve ser maior que zero"),
  observacoes: z.string().optional(),
  urgencia: z.enum(["baixa", "media", "alta"]).default("baixa"),
});

export type CreateVacationRequestInput = z.infer<
  typeof createVacationRequestSchema
>;

