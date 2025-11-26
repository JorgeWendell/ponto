"use server";

import { db } from "@/db";
import { marcacoesPontoTable, colaboradoresTable } from "@/db/schema";
import { eq, and, gte, lt, sql } from "drizzle-orm";

export async function getWeeklyPresence(days: number = 7) {
  try {
    const agora = new Date();
    const inicioPeriodo = new Date(agora);
    inicioPeriodo.setDate(agora.getDate() - days);
    inicioPeriodo.setHours(0, 0, 0, 0);

    const fimPeriodo = new Date(agora);
    fimPeriodo.setHours(23, 59, 59, 999);

    // Buscar total de colaboradores ativos
    const [totalColaboradores] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(colaboradoresTable)
      .where(eq(colaboradoresTable.status, "ativo"));

    const total = totalColaboradores?.count || 0;

    // Para períodos de 7 dias, mostrar dias da semana
    // Para períodos maiores, agrupar por semana
    const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex"];
    const dadosPresenca = [];
    
    if (days <= 7) {
      // Mostrar cada dia da semana
      for (let i = 0; i < 5; i++) {
        const dia = new Date(inicioPeriodo);
        dia.setDate(inicioPeriodo.getDate() + i);
        const proximoDia = new Date(dia);
        proximoDia.setDate(dia.getDate() + 1);
        
        // Se o dia for no futuro, pular
        if (dia > agora) continue;

        // Contar marcações de entrada por dia
        const [marcacoesEntrada] = await db
          .select({ count: sql<number>`count(distinct ${marcacoesPontoTable.colaboradorId})::int` })
          .from(marcacoesPontoTable)
          .where(
            and(
              eq(marcacoesPontoTable.tipo, "ENTRADA"),
              gte(marcacoesPontoTable.dataHora, dia),
              lt(marcacoesPontoTable.dataHora, proximoDia)
            )
          );

        const presentes = marcacoesEntrada?.count || 0;
        const ausentes = total - presentes;
        const parcial = 0;

        dadosPresenca.push({
          dia: diasSemana[i],
          presente: Math.round((presentes / total) * 100) || 0,
          parcial: parcial,
          ausente: Math.round((ausentes / total) * 100) || 0,
        });
      }
    } else {
      // Para períodos maiores, agrupar por semana
      const numSemanas = Math.ceil(days / 7);
      for (let semana = 0; semana < numSemanas && semana < 5; semana++) {
        const inicioSemana = new Date(inicioPeriodo);
        inicioSemana.setDate(inicioPeriodo.getDate() + (semana * 7));
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        fimSemana.setHours(23, 59, 59, 999);
        
        // Se a semana for no futuro, pular
        if (inicioSemana > agora) continue;

        // Contar marcações de entrada na semana
        const [marcacoesEntrada] = await db
          .select({ count: sql<number>`count(distinct ${marcacoesPontoTable.colaboradorId})::int` })
          .from(marcacoesPontoTable)
          .where(
            and(
              eq(marcacoesPontoTable.tipo, "ENTRADA"),
              gte(marcacoesPontoTable.dataHora, inicioSemana),
              lt(marcacoesPontoTable.dataHora, fimSemana)
            )
          );

        const presentes = marcacoesEntrada?.count || 0;
        const ausentes = total - presentes;
        const parcial = 0;

        dadosPresenca.push({
          dia: `Sem ${semana + 1}`,
          presente: Math.round((presentes / total) * 100) || 0,
          parcial: parcial,
          ausente: Math.round((ausentes / total) * 100) || 0,
        });
      }
    }

    return {
      success: true,
      data: dadosPresenca,
    };
  } catch (error: any) {
    console.error("Erro ao buscar presença semanal:", error);
    return {
      success: false,
      error: error?.message || "Erro ao buscar presença semanal",
      data: [],
    };
  }
}

