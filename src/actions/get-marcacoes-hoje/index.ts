"use server";

import { db } from "@/db";
import { marcacoesPontoTable } from "@/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

export async function getMarcacoesHoje(colaboradorId: string) {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const marcacoes = await db
      .select()
      .from(marcacoesPontoTable)
      .where(
        and(
          eq(marcacoesPontoTable.colaboradorId, colaboradorId),
          gte(marcacoesPontoTable.dataHora, hoje),
          lt(marcacoesPontoTable.dataHora, amanha)
        )
      )
      .orderBy(marcacoesPontoTable.dataHora);

    return { success: true, data: marcacoes };
  } catch (error: any) {
    console.error("Erro ao buscar marcações do dia:", error);
    return {
      success: false,
      error: error?.message || "Erro ao buscar marcações",
      data: [],
    };
  }
}

export async function getMarcacoesDia(
  colaboradorId: string,
  date: string
) {
  try {
    const [yearStr, monthStr, dayStr] = date.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    const dia = new Date(year, month - 1, day);
    dia.setHours(0, 0, 0, 0);
    const proximoDia = new Date(dia);
    proximoDia.setDate(proximoDia.getDate() + 1);

    const marcacoes = await db
      .select()
      .from(marcacoesPontoTable)
      .where(
        and(
          eq(marcacoesPontoTable.colaboradorId, colaboradorId),
          gte(marcacoesPontoTable.dataHora, dia),
          lt(marcacoesPontoTable.dataHora, proximoDia)
        )
      )
      .orderBy(marcacoesPontoTable.dataHora);

    return { success: true, data: marcacoes };
  } catch (error: any) {
    console.error("Erro ao buscar marcações do dia:", error);
    return {
      success: false,
      error: error?.message || "Erro ao buscar marcações do dia",
      data: [],
    };
  }
}

