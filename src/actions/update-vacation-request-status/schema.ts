import { z } from "zod";

export const updateVacationRequestStatusSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  status: z.enum(["pendente", "aprovado", "rejeitado"]),
  motivoRejeicao: z.string().optional(),
});

export type UpdateVacationRequestStatusInput = z.infer<
  typeof updateVacationRequestStatusSchema
>;

