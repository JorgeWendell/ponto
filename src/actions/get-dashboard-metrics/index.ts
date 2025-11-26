"use server";

import { db } from "@/db";
import { colaboradoresTable, solicitacoesFeriasTable, marcacoesPontoTable } from "@/db/schema";
import { eq, and, gte, lt, sql, count } from "drizzle-orm";

export async function getDashboardMetrics(days: number = 30) {
  try {
    const agora = new Date();
    const inicioPeriodo = new Date(agora);
    inicioPeriodo.setDate(agora.getDate() - days);
    inicioPeriodo.setHours(0, 0, 0, 0);
    
    const inicioPeriodoAnterior = new Date(inicioPeriodo);
    inicioPeriodoAnterior.setDate(inicioPeriodoAnterior.getDate() - days);
    
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0);

    // Total de colaboradores ativos
    const [totalColaboradores] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(colaboradoresTable)
      .where(eq(colaboradoresTable.status, "ativo"));

    // Solicitações pendentes (no período)
    const [solicitacoesPendentes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(solicitacoesFeriasTable)
      .where(
        and(
          eq(solicitacoesFeriasTable.status, "pendente"),
          gte(solicitacoesFeriasTable.createdAt, inicioPeriodo)
        )
      );

    // Solicitações pendentes período anterior
    const [solicitacoesPendentesPeriodoAnterior] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(solicitacoesFeriasTable)
      .where(
        and(
          eq(solicitacoesFeriasTable.status, "pendente"),
          gte(solicitacoesFeriasTable.createdAt, inicioPeriodoAnterior),
          lt(solicitacoesFeriasTable.createdAt, inicioPeriodo)
        )
      );

    // Férias próximas (próximos X dias baseado no período)
    const proximosDias = new Date(agora);
    proximosDias.setDate(proximosDias.getDate() + days);
    const agoraStr = agora.toISOString().split('T')[0]; // YYYY-MM-DD
    const proximosDiasStr = proximosDias.toISOString().split('T')[0]; // YYYY-MM-DD

    const [feriasProximas] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(solicitacoesFeriasTable)
      .where(
        and(
          eq(solicitacoesFeriasTable.status, "aprovado"),
          gte(solicitacoesFeriasTable.dataInicio, agoraStr),
          lt(solicitacoesFeriasTable.dataInicio, proximosDiasStr)
        )
      );

    // Férias próximas período anterior
    const inicioPeriodoAnteriorParaFerias = new Date(agora);
    inicioPeriodoAnteriorParaFerias.setDate(agora.getDate() - days);
    const inicioPeriodoAnteriorParaFeriasStr = inicioPeriodoAnteriorParaFerias.toISOString().split('T')[0]; // YYYY-MM-DD
    const [feriasProximasPeriodoAnterior] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(solicitacoesFeriasTable)
      .where(
        and(
          eq(solicitacoesFeriasTable.status, "aprovado"),
          gte(solicitacoesFeriasTable.dataInicio, inicioPeriodoAnteriorParaFeriasStr),
          lt(solicitacoesFeriasTable.dataInicio, agoraStr)
        )
      );

    // Absenteísmo (simplificado: faltas no mês)
    // Considerando que ausência = sem marcação de entrada no dia
    const diasUteisMes = 22; // Aproximação
    const diasUteisMesAnterior = 22;

    // Para simplificar, vamos calcular absenteísmo baseado em dias sem marcação
    // Isso seria melhor calculado com uma query mais complexa, mas por enquanto vamos usar um valor aproximado
    const absenteismoAtual = 3.2; // Placeholder - precisa de cálculo real
    const absenteismoAnterior = 3.7; // Placeholder

    // Ciclos de avaliação ativos (placeholder - precisa de tabela de avaliações)
    const ciclosAvaliacaoAtivos = 3;

    return {
      success: true,
      data: {
        absenteismo: {
          valor: absenteismoAtual,
          variacao: absenteismoAnterior - absenteismoAtual,
        },
        solicitacoesPendentes: {
          valor: solicitacoesPendentes.count || 0,
          variacao: (solicitacoesPendentes.count || 0) - (solicitacoesPendentesPeriodoAnterior.count || 0),
        },
        ciclosAvaliacaoAtivos: ciclosAvaliacaoAtivos,
        feriasProximas: {
          valor: feriasProximas.count || 0,
          variacao: (feriasProximas.count || 0) - (feriasProximasPeriodoAnterior.count || 0),
        },
      },
    };
  } catch (error: any) {
    console.error("Erro ao buscar métricas do dashboard:", error);
    return {
      success: false,
      error: error?.message || "Erro ao buscar métricas",
      data: null,
    };
  }
}

