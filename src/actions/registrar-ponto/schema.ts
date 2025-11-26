import { z } from "zod";

export const registrarPontoSchema = z.object({
  colaboradorId: z.string().min(1, "ID do colaborador é obrigatório"),
  tipo: z.enum(["ENTRADA", "SAIDA", "ENTRADA_ALMOCO", "VOLTA_ALMOCO"]),
  metodo: z.enum(["FACIAL", "MANUAL", "QRCODE"]),
  fotoCapturadaUrl: z.string().optional(),
  localizacaoLatitude: z.string().optional(),
  localizacaoLongitude: z.string().optional(),
  dispositivoInfo: z.string().optional(),
  justificativa: z.string().optional(),
});

export type RegistrarPontoInput = z.infer<typeof registrarPontoSchema>;

