"use server";

import { db } from "@/db";
import { solicitacoesFeriasTable, colaboradoresTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getVacationRequests() {
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
      colaborador: {
        id: colaboradoresTable.id,
        nomeCompleto: colaboradoresTable.nomeCompleto,
        departamentoId: colaboradoresTable.departamentoId,
      },
    })
    .from(solicitacoesFeriasTable)
    .leftJoin(
      colaboradoresTable,
      eq(solicitacoesFeriasTable.colaboradorId, colaboradoresTable.id)
    )
    .orderBy(desc(solicitacoesFeriasTable.createdAt));

  return { success: true, data: solicitacoes };
}

