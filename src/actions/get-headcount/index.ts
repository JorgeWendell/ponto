"use server";

import { db } from "@/db";
import { colaboradoresTable, departamentosTable } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";

export async function getHeadcount() {
  try {
    // Buscar departamentos
    const departamentos = await db
      .select({
        id: departamentosTable.id,
        nome: departamentosTable.nome,
      })
      .from(departamentosTable)
      .where(eq(departamentosTable.ativo, true));

    // Para cada departamento, contar colaboradores ativos
    const headcountData = await Promise.all(
      departamentos.map(async (dept) => {
        const [atual] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(colaboradoresTable)
          .where(
            and(
              eq(colaboradoresTable.departamentoId, dept.id),
              eq(colaboradoresTable.status, "ativo")
            )
          );

        // Planejado = atual + 10% (placeholder - deveria vir de uma tabela de planejamento)
        const planejado = Math.round((atual?.count || 0) * 1.1);

        return {
          departamento: dept.nome,
          atual: atual?.count || 0,
          planejado: planejado,
        };
      })
    );

    return {
      success: true,
      data: headcountData,
    };
  } catch (error: any) {
    console.error("Erro ao buscar headcount:", error);
    return {
      success: false,
      error: error?.message || "Erro ao buscar headcount",
      data: [],
    };
  }
}

