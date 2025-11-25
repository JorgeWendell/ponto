import { z } from "zod";

export const updateDepartmentSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  codigo: z.string().min(1, "Código é obrigatório"),
  nome: z.string().min(2, "Nome é obrigatório"),
  descricao: z.string().optional(),
  departamentoPaiId: z.string().optional(),
  gestorId: z.string().optional(),
  centroCusto: z.string().optional(),
  ativo: z.boolean().default(true),
});

export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

