"use server";

import { db } from "@/db";
import { solicitacoesFeriasTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateVacationRequestStatusSchema } from "./schema";

export async function updateVacationRequestStatus(
  input: unknown
) {
  const validated = updateVacationRequestStatusSchema.parse(input);

  const updateData: {
    status: string;
    motivoRejeicao?: string | null;
    dataAprovacao?: Date | null;
  } = {
    status: validated.status,
  };

  if (validated.status === "rejeitado") {
    updateData.motivoRejeicao = validated.motivoRejeicao || null;
  }

  if (validated.status === "aprovado") {
    updateData.dataAprovacao = new Date();
  }

  const [solicitacao] = await db
    .update(solicitacoesFeriasTable)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(solicitacoesFeriasTable.id, validated.id))
    .returning();

  return { success: true, data: solicitacao };
}

