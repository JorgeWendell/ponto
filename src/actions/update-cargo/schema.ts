import { z } from "zod";

const nivelValues = [
  "Júnior",
  "Pleno",
  "Sênior",
  "Especialista",
  "Gerente",
  "Diretor",
] as const;

export const updateCargoSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  codigo: z.string().min(1, "Código é obrigatório"),
  titulo: z.string().min(2, "Título é obrigatório"),
  descricao: z.string().optional(),
  nivel: z.enum(nivelValues).optional(),
  cbo: z.string().optional(),
  salarioMinimo: z.string().optional(),
  salarioMaximo: z.string().optional(),
  escolaridadeMinima: z.string().optional(),
  experienciaMinimaAnos: z.string().optional(),
  ativo: z.boolean().default(true),
});

export type UpdateCargoInput = z.infer<typeof updateCargoSchema>;

