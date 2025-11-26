"use server";

import { db } from "@/db";
import { unidadesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUnitById(id: string) {
  const [unidade] = await db
    .select()
    .from(unidadesTable)
    .where(eq(unidadesTable.id, id))
    .limit(1);

  if (!unidade) {
    return { success: false, data: null };
  }

  return { success: true, data: unidade };
}

