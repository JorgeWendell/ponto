"use server";

import { db } from "@/db";
import { unidadesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deactivateUnit(id: string) {
  try {
    const [unidade] = await db
      .update(unidadesTable)
      .set({
        ativo: false,
        updatedAt: new Date(),
      })
      .where(eq(unidadesTable.id, id))
      .returning();

    return { success: true, data: unidade };
  } catch (error: any) {
    throw new Error(error?.message || "Erro ao desativar unidade");
  }
}

