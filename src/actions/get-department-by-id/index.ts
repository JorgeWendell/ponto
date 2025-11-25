"use server";

import { db } from "@/db";
import { departamentosTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getDepartmentById(id: string) {
  const [departamento] = await db
    .select()
    .from(departamentosTable)
    .where(eq(departamentosTable.id, id))
    .limit(1);

  if (!departamento) {
    return { success: false, data: null };
  }

  return { success: true, data: departamento };
}

