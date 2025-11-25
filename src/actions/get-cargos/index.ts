"use server";

import { db } from "@/db";
import { cargosTable, colaboradoresTable } from "@/db/schema";
import { eq, ilike, or, and, desc, asc, sql } from "drizzle-orm";

interface GetCargosParams {
  search?: string;
  nivel?: string;
  ativo?: boolean;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export async function getCargos(params: GetCargosParams = {}) {
  const {
    search = "",
    nivel,
    ativo,
    page = 1,
    limit = 10,
    orderBy = "createdAt",
    orderDirection = "desc",
  } = params;

  const offset = (page - 1) * limit;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(cargosTable.codigo, `%${search}%`),
        ilike(cargosTable.titulo, `%${search}%`)
      )!
    );
  }

  if (nivel) {
    conditions.push(eq(cargosTable.nivel, nivel));
  }

  if (ativo !== undefined) {
    conditions.push(eq(cargosTable.ativo, ativo));
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  const orderByField =
    orderBy === "codigo"
      ? cargosTable.codigo
      : orderBy === "titulo"
      ? cargosTable.titulo
      : orderBy === "nivel"
      ? cargosTable.nivel
      : cargosTable.createdAt;

  const orderFn = orderDirection === "asc" ? asc : desc;

  const cargos = await db
    .select({
      id: cargosTable.id,
      codigo: cargosTable.codigo,
      titulo: cargosTable.titulo,
      descricao: cargosTable.descricao,
      nivel: cargosTable.nivel,
      cbo: cargosTable.cbo,
      salarioMinimo: cargosTable.salarioMinimo,
      salarioMaximo: cargosTable.salarioMaximo,
      escolaridadeMinima: cargosTable.escolaridadeMinima,
      experienciaMinimaAnos: cargosTable.experienciaMinimaAnos,
      ativo: cargosTable.ativo,
      createdAt: cargosTable.createdAt,
    })
    .from(cargosTable)
    .where(whereClause)
    .orderBy(orderFn(orderByField))
    .limit(limit)
    .offset(offset);

  // Contar colaboradores por cargo
  const cargosComContagem = await Promise.all(
    cargos.map(async (cargo) => {
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(colaboradoresTable)
        .where(eq(colaboradoresTable.cargoId, cargo.id));

      return {
        ...cargo,
        totalColaboradores: countResult?.count || 0,
      };
    })
  );

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cargosTable)
    .where(whereClause);

  const total = totalResult?.count || 0;

  return {
    success: true,
    data: cargosComContagem,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
