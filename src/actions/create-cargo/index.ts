"use server";

import { randomUUID } from "crypto";
import { db } from "@/db";
import { cargosTable } from "@/db/schema";
import { createCargoSchema } from "./schema";

export async function createCargo(input: unknown) {
  const validated = createCargoSchema.parse(input);

  const salarioMinimoValue = validated.salarioMinimo
    ? (() => {
        const cleaned = validated.salarioMinimo.replace(/[^\d,.-]/g, "");
        const normalized = cleaned.replace(",", ".");
        const parsed = parseFloat(normalized);
        return isNaN(parsed) ? null : parsed.toFixed(2);
      })()
    : null;

  const salarioMaximoValue = validated.salarioMaximo
    ? (() => {
        const cleaned = validated.salarioMaximo.replace(/[^\d,.-]/g, "");
        const normalized = cleaned.replace(",", ".");
        const parsed = parseFloat(normalized);
        return isNaN(parsed) ? null : parsed.toFixed(2);
      })()
    : null;

  try {
    const [cargo] = await db
      .insert(cargosTable)
      .values({
        id: randomUUID(),
        codigo: validated.codigo,
        titulo: validated.titulo,
        descricao: validated.descricao || null,
        nivel: validated.nivel || null,
        cbo: validated.cbo || null,
        salarioMinimo: salarioMinimoValue,
        salarioMaximo: salarioMaximoValue,
        escolaridadeMinima: validated.escolaridadeMinima || null,
        experienciaMinimaAnos: validated.experienciaMinimaAnos
          ? parseInt(validated.experienciaMinimaAnos)
          : null,
        ativo: validated.ativo ?? true,
      })
      .returning();

    return { success: true, data: cargo };
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new Error("Já existe um cargo com este código cadastrado.");
    }
    throw error;
  }
}

