"use server";

import { randomUUID } from "crypto";
import { db } from "@/db";
import { departamentosTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createDepartmentSchema } from "./schema";

export async function createDepartment(input: unknown) {
  const validated = createDepartmentSchema.parse(input);

  // Validar que o departamento pai não é ele mesmo (se houver)
  if (validated.departamentoPaiId) {
    // Verificar se o departamento pai existe
    const [pai] = await db
      .select({ id: departamentosTable.id })
      .from(departamentosTable)
      .where(eq(departamentosTable.id, validated.departamentoPaiId))
      .limit(1);

    if (!pai) {
      throw new Error("Departamento pai não encontrado.");
    }
  }

  try {
    const [departamento] = await db
      .insert(departamentosTable)
      .values({
        id: randomUUID(),
        codigo: validated.codigo,
        nome: validated.nome,
        descricao: validated.descricao || null,
        departamentoPaiId: validated.departamentoPaiId || null,
        gestorId: validated.gestorId || null,
        centroCusto: validated.centroCusto || null,
        ativo: validated.ativo ?? true,
      })
      .returning();

    return { success: true, data: departamento };
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new Error("Já existe um departamento com este código cadastrado.");
    }
    throw error;
  }
}

