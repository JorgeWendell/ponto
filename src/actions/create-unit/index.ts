"use server";

import { randomUUID } from "crypto";
import { db } from "@/db";
import { unidadesTable } from "@/db/schema";
import { createUnitSchema } from "./schema";

export async function createUnit(input: unknown) {
  const validated = createUnitSchema.parse(input);

  try {
    const [unidade] = await db
      .insert(unidadesTable)
      .values({
        id: randomUUID(),
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
      })
      .returning();

    return { success: true, data: unidade };
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new Error("Já existe uma unidade com este código cadastrada.");
    }
    throw error;
  }
}

