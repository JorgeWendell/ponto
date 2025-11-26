"use server";

import { db } from "@/db";
import { solicitacoesFeriasTable, colaboradoresTable } from "@/db/schema";
import { eq, and, desc, or, sql } from "drizzle-orm";

export async function getImmediateActions(limit: number = 5) {
  try {
    const solicitacoes = await db
      .select({
        id: solicitacoesFeriasTable.id,
        colaboradorId: solicitacoesFeriasTable.colaboradorId,
        dataInicio: solicitacoesFeriasTable.dataInicio,
        dataFim: solicitacoesFeriasTable.dataFim,
        totalDias: solicitacoesFeriasTable.totalDias,
        status: solicitacoesFeriasTable.status,
        urgencia: solicitacoesFeriasTable.urgencia,
        observacoes: solicitacoesFeriasTable.observacoes,
        createdAt: solicitacoesFeriasTable.createdAt,
        tipo: sql<string>`'ferias'`,
        colaborador: {
          id: colaboradoresTable.id,
          nomeCompleto: colaboradoresTable.nomeCompleto,
          avatarUrl: colaboradoresTable.avatarUrl,
        },
      })
      .from(solicitacoesFeriasTable)
      .leftJoin(
        colaboradoresTable,
        eq(solicitacoesFeriasTable.colaboradorId, colaboradoresTable.id)
      )
      .where(eq(solicitacoesFeriasTable.status, "pendente"))
      .orderBy(desc(solicitacoesFeriasTable.createdAt))
      .limit(limit);

    // TODO: Adicionar ajustes de ponto quando a tabela existir
    // Por enquanto, retornamos apenas solicitações de férias

    return {
      success: true,
      data: solicitacoes.map((s) => ({
        id: s.id,
        tipo: s.tipo,
        colaborador: s.colaborador,
        urgencia: s.urgencia,
        dataInicio: s.dataInicio,
        dataFim: s.dataFim,
        totalDias: s.totalDias,
        observacoes: s.observacoes,
        createdAt: s.createdAt,
      })),
    };
  } catch (error: any) {
    console.error("Erro ao buscar ações imediatas:", error);
    return {
      success: false,
      error: error?.message || "Erro ao buscar ações imediatas",
      data: [],
    };
  }
}

