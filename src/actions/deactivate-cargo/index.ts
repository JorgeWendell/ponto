"use server";

import { db } from "@/db";
import { cargosTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deactivateCargo(id: string) {
  try {
    const [cargo] = await db
      .update(cargosTable)
      .set({
        ativo: false,
        updatedAt: new Date(),
      })
      .where(eq(cargosTable.id, id))
      .returning();

    return { success: true, data: cargo };
  } catch (error: any) {
    throw error;
  }
}

