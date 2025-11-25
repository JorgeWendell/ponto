"use server";

import { db } from "@/db";
import { cargosTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateCargoSchema } from "./schema";

export async function updateCargo(input: unknown) {
  const validated = updateCargoSchema.parse(input);

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
      .update(cargosTable)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(cargosTable.id, validated.id))
      .returning();

    return { success: true, data: cargo };
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new Error("Já existe um cargo com este código cadastrado.");
    }
    throw error;
  }
}

