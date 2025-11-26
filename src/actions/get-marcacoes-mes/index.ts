"use server";

import { db } from "@/db";
import { marcacoesPontoTable } from "@/db/schema";
import { and, eq, gte, lt } from "drizzle-orm";

export async function getMarcacoesMes(
  colaboradorId: string,
  referenceDate?: string
) {
  try {
    const base = referenceDate ? new Date(referenceDate) : new Date();
    const inicioMes = new Date(base.getFullYear(), base.getMonth(), 1);
    const inicioProximoMes = new Date(
      base.getFullYear(),
      base.getMonth() + 1,
      1
    );

    const marcacoes = await db
      .select()
      .from(marcacoesPontoTable)
      .where(
        and(
          eq(marcacoesPontoTable.colaboradorId, colaboradorId),
          gte(marcacoesPontoTable.dataHora, inicioMes),
          lt(marcacoesPontoTable.dataHora, inicioProximoMes)
        )
      )
      .orderBy(marcacoesPontoTable.dataHora);

    return { success: true, data: marcacoes };
  } catch (error: any) {
    console.error("Erro ao buscar marcações do mês:", error);
    return {
      success: false,
      error: error?.message || "Erro ao buscar marcações do mês",
      data: [],
    };
  }
}


