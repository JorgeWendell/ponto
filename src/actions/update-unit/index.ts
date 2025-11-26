"use server";

import { db } from "@/db";
import { unidadesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateUnitSchema } from "./schema";

export async function updateUnit(input: unknown) {
  const validated = updateUnitSchema.parse(input);

  try {
    const [unidade] = await db
      .update(unidadesTable)
      .set({
        codigo: validated.codigo,
        nome: validated.nome,
        tipo: validated.tipo || null,
        cep: validated.cep || null,
        logradouro: validated.logradouro || null,
        numero: validated.numero || null,
        complemento: validated.complemento || null,
        bairro: validated.bairro || null,
        cidade: validated.cidade || null,
        estado: validated.estado || null,
        telefone: validated.telefone || null,
        email: validated.email || null,
        ativo: validated.ativo ?? true,
        updatedAt: new Date(),
      })
      .where(eq(unidadesTable.id, validated.id))
      .returning();

    return { success: true, data: unidade };
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new Error("Já existe uma unidade com este código cadastrada.");
    }
    throw error;
  }
}

