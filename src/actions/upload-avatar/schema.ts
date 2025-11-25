import { z } from "zod";

export const uploadAvatarSchema = z.object({
  collaboratorId: z.string().min(1, "ID do colaborador é obrigatório"),
  file: z.instanceof(File, { message: "Arquivo é obrigatório" }),
});

export type UploadAvatarInput = z.infer<typeof uploadAvatarSchema>;

