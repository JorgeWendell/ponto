"use server";

import { randomUUID } from "crypto";
import { db } from "@/db";
import { solicitacoesFeriasTable } from "@/db/schema";
import { createVacationRequestSchema } from "./schema";

export async function createVacationRequest(input: unknown) {
  const validated = createVacationRequestSchema.parse(input);

  const [solicitacao] = await db
    .insert(solicitacoesFeriasTable)
    .values({
      id: randomUUID(),
      colaboradorId: validated.colaboradorId,
      dataInicio: validated.dataInicio,
      dataFim: validated.dataFim,
      totalDias: validated.totalDias,
      observacoes: validated.observacoes || null,
      urgencia: validated.urgencia,
      status: "pendente",
    })
    .returning();

  return { success: true, data: solicitacao };
}

