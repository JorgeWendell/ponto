import { z } from "zod";

export const createDepartmentSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório"),
  nome: z.string().min(2, "Nome é obrigatório"),
  descricao: z.string().optional(),
  departamentoPaiId: z.string().optional(),
  gestorId: z.string().optional(),
  centroCusto: z.string().optional(),
  ativo: z.boolean().default(true),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

