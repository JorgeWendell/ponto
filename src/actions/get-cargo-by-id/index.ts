"use server";

import { db } from "@/db";
import { cargosTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCargoById(id: string) {
  const [cargo] = await db
    .select()
    .from(cargosTable)
    .where(eq(cargosTable.id, id))
    .limit(1);

  if (!cargo) {
    return { success: false, data: null };
  }

  return { success: true, data: cargo };
}

