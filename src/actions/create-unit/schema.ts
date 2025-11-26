import { z } from "zod";

export const createUnitSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório"),
  nome: z.string().min(2, "Nome é obrigatório"),
  tipo: z.string().optional(),
  cep: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  ativo: z.boolean().default(true),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;

