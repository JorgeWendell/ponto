"use server";

import { db } from "@/db";
import { unidadesTable, colaboradoresTable } from "@/db/schema";
import { eq, ilike, or, and, desc, asc, sql } from "drizzle-orm";

interface GetUnitsParams {
  search?: string;
  tipo?: string;
  ativo?: boolean;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export async function getUnits(params: GetUnitsParams = {}) {
  const {
    search = "",
    tipo,
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
        ilike(unidadesTable.codigo, `%${search}%`),
        ilike(unidadesTable.nome, `%${search}%`)
      )!
    );
  }

  if (tipo) {
    conditions.push(eq(unidadesTable.tipo, tipo));
  }

  if (ativo !== undefined) {
    conditions.push(eq(unidadesTable.ativo, ativo));
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  const orderByField =
    orderBy === "codigo"
      ? unidadesTable.codigo
      : orderBy === "nome"
      ? unidadesTable.nome
      : unidadesTable.createdAt;

  const orderFn = orderDirection === "asc" ? asc : desc;

  const unidadesRaw = await db
    .select({
      id: unidadesTable.id,
      codigo: unidadesTable.codigo,
      nome: unidadesTable.nome,
      tipo: unidadesTable.tipo,
      cep: unidadesTable.cep,
      logradouro: unidadesTable.logradouro,
      numero: unidadesTable.numero,
      complemento: unidadesTable.complemento,
      bairro: unidadesTable.bairro,
      cidade: unidadesTable.cidade,
      estado: unidadesTable.estado,
      telefone: unidadesTable.telefone,
      email: unidadesTable.email,
      ativo: unidadesTable.ativo,
      createdAt: unidadesTable.createdAt,
    })
    .from(unidadesTable)
    .where(whereClause)
    .orderBy(orderFn(orderByField))
    .limit(limit)
    .offset(offset);

  // Contar colaboradores por unidade
  const unidades = await Promise.all(
    unidadesRaw.map(async (unidade) => {
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(colaboradoresTable)
        .where(eq(colaboradoresTable.unidadeId, unidade.id));

      return {
        ...unidade,
        totalColaboradores: countResult?.count || 0,
      };
    })
  );

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(unidadesTable)
    .where(whereClause);

  const total = totalResult?.count || 0;

  return {
    success: true,
    data: unidades,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

