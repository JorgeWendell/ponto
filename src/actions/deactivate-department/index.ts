"use server";

import { db } from "@/db";
import { departamentosTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deactivateDepartment(id: string) {
  try {
    const [departamento] = await db
      .update(departamentosTable)
      .set({
        ativo: false,
        updatedAt: new Date(),
      })
      .where(eq(departamentosTable.id, id))
      .returning();

    return { success: true, data: departamento };
  } catch (error: any) {
    throw error;
  }
}

