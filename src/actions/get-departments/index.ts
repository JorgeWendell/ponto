"use server";

import { db } from "@/db";
import {
  departamentosTable,
  colaboradoresTable,
  colaboradoresTable as gestorTable,
} from "@/db/schema";
import { eq, ilike, or, and, desc, asc, sql } from "drizzle-orm";

interface GetDepartmentsParams {
  search?: string;
  departamentoPaiId?: string;
  ativo?: boolean;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export async function getDepartments(params: GetDepartmentsParams = {}) {
  const {
    search = "",
    departamentoPaiId,
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
        ilike(departamentosTable.codigo, `%${search}%`),
        ilike(departamentosTable.nome, `%${search}%`)
      )!
    );
  }

  if (departamentoPaiId) {
    conditions.push(eq(departamentosTable.departamentoPaiId, departamentoPaiId));
  }

  if (ativo !== undefined) {
    conditions.push(eq(departamentosTable.ativo, ativo));
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  const orderByField =
    orderBy === "codigo"
      ? departamentosTable.codigo
      : orderBy === "nome"
      ? departamentosTable.nome
      : departamentosTable.createdAt;

  const orderFn = orderDirection === "asc" ? asc : desc;


  const departamentosRaw = await db
    .select({
      id: departamentosTable.id,
      codigo: departamentosTable.codigo,
      nome: departamentosTable.nome,
      descricao: departamentosTable.descricao,
      departamentoPaiId: departamentosTable.departamentoPaiId,
      gestorId: departamentosTable.gestorId,
      centroCusto: departamentosTable.centroCusto,
      ativo: departamentosTable.ativo,
      createdAt: departamentosTable.createdAt,
    })
    .from(departamentosTable)
    .where(whereClause)
    .orderBy(orderFn(orderByField))
    .limit(limit)
    .offset(offset);

  // Buscar departamento pai e gestor corretamente
  const departamentos = await Promise.all(
    departamentosRaw.map(async (dept) => {
      let departamentoPai = null;
      let gestor = null;

      if (dept.departamentoPaiId) {
        const [pai] = await db
          .select({ id: departamentosTable.id, nome: departamentosTable.nome })
          .from(departamentosTable)
          .where(eq(departamentosTable.id, dept.departamentoPaiId))
          .limit(1);
        departamentoPai = pai || null;
      }

      if (dept.gestorId) {
        const [gestorData] = await db
          .select({
            id: gestorTable.id,
            nomeCompleto: gestorTable.nomeCompleto,
          })
          .from(gestorTable)
          .where(eq(gestorTable.id, dept.gestorId))
          .limit(1);
        gestor = gestorData || null;
      }

      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(colaboradoresTable)
        .where(eq(colaboradoresTable.departamentoId, dept.id));

      return {
        ...dept,
        departamentoPai,
        gestor,
        totalColaboradores: countResult?.count || 0,
      };
    })
  );

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(departamentosTable)
    .where(whereClause);

  const total = totalResult?.count || 0;

  return {
    success: true,
    data: departamentos,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
