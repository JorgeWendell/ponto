"use server";

import { db } from "@/db";
import { colaboradoresTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deactivateCollaborator(id: string) {
  try {
    const [colaborador] = await db
      .update(colaboradoresTable)
      .set({
        status: "inativo",
        updatedAt: new Date(),
      })
      .where(eq(colaboradoresTable.id, id))
      .returning();

    return { success: true, data: colaborador };
  } catch (error: any) {
    throw error;
  }
}

