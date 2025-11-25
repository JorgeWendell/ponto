"use server";

import { db } from "@/db";
import { departamentosTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateDepartmentSchema } from "./schema";

export async function updateDepartment(input: unknown) {
  const validated = updateDepartmentSchema.parse(input);

  // Validar que o departamento pai não é ele mesmo
  if (validated.departamentoPaiId === validated.id) {
    throw new Error("Um departamento não pode ser pai de si mesmo.");
  }

  // Validar que o departamento pai não é filho deste departamento (evitar referência circular)
  if (validated.departamentoPaiId) {
    const [pai] = await db
      .select({ id: departamentosTable.id, departamentoPaiId: departamentosTable.departamentoPaiId })
      .from(departamentosTable)
      .where(eq(departamentosTable.id, validated.departamentoPaiId))
      .limit(1);

    if (!pai) {
      throw new Error("Departamento pai não encontrado.");
    }

    // Verificar referência circular
    let currentId = pai.departamentoPaiId;
    while (currentId) {
      if (currentId === validated.id) {
        throw new Error("Referência circular detectada. O departamento pai não pode ser filho deste departamento.");
      }
      const [current] = await db
        .select({ departamentoPaiId: departamentosTable.departamentoPaiId })
        .from(departamentosTable)
        .where(eq(departamentosTable.id, currentId))
        .limit(1);
      currentId = current?.departamentoPaiId || null;
    }
  }

  try {
    const [departamento] = await db
      .update(departamentosTable)
      .set({
        codigo: validated.codigo,
        nome: validated.nome,
        descricao: validated.descricao || null,
        departamentoPaiId: validated.departamentoPaiId || null,
        gestorId: validated.gestorId || null,
        centroCusto: validated.centroCusto || null,
        ativo: validated.ativo ?? true,
        updatedAt: new Date(),
      })
      .where(eq(departamentosTable.id, validated.id))
      .returning();

    return { success: true, data: departamento };
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new Error("Já existe um departamento com este código cadastrado.");
    }
    throw error;
  }
}

