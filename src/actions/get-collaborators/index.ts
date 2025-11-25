"use server";

import { db } from "@/db";
import {
  colaboradoresTable,
  cargosTable,
  departamentosTable,
  unidadesTable,
} from "@/db/schema";
import { eq, ilike, or, and, desc, asc, sql } from "drizzle-orm";

interface GetCollaboratorsParams {
  search?: string;
  status?: string;
  departamentoId?: string;
  cargoId?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export async function getCollaborators(params: GetCollaboratorsParams = {}) {
  const {
    search = "",
    status,
    departamentoId,
    cargoId,
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
        ilike(colaboradoresTable.nomeCompleto, `%${search}%`),
        ilike(colaboradoresTable.matricula, `%${search}%`),
        ilike(colaboradoresTable.emailCorporativo, `%${search}%`)
      )!
    );
  }

  if (status && status !== "todos") {
    conditions.push(eq(colaboradoresTable.status, status));
  }

  if (departamentoId) {
    conditions.push(eq(colaboradoresTable.departamentoId, departamentoId));
  }

  if (cargoId) {
    conditions.push(eq(colaboradoresTable.cargoId, cargoId));
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  const orderByField =
    orderBy === "nome"
      ? colaboradoresTable.nomeCompleto
      : orderBy === "matricula"
      ? colaboradoresTable.matricula
      : orderBy === "dataAdmissao"
      ? colaboradoresTable.dataAdmissao
      : colaboradoresTable.createdAt;

  const orderFn = orderDirection === "asc" ? asc : desc;

  // Usando db.select com leftJoin para ter controle sobre where e orderBy
  const colaboradoresRaw = await db
    .select({
      id: colaboradoresTable.id,
      matricula: colaboradoresTable.matricula,
      nomeCompleto: colaboradoresTable.nomeCompleto,
      emailCorporativo: colaboradoresTable.emailCorporativo,
      status: colaboradoresTable.status,
      dataAdmissao: colaboradoresTable.dataAdmissao,
      createdAt: colaboradoresTable.createdAt,
      avatarUrl: colaboradoresTable.avatarUrl,
      fotoUrl: colaboradoresTable.fotoUrl,
      cargo: {
        id: cargosTable.id,
        titulo: cargosTable.titulo,
      },
      departamento: {
        id: departamentosTable.id,
        nome: departamentosTable.nome,
      },
      unidade: {
        id: unidadesTable.id,
        nome: unidadesTable.nome,
      },
    })
    .from(colaboradoresTable)
    .leftJoin(cargosTable, eq(colaboradoresTable.cargoId, cargosTable.id))
    .leftJoin(
      departamentosTable,
      eq(colaboradoresTable.departamentoId, departamentosTable.id)
    )
    .leftJoin(unidadesTable, eq(colaboradoresTable.unidadeId, unidadesTable.id))
    .where(whereClause)
    .orderBy(orderFn(orderByField))
    .limit(limit)
    .offset(offset);

  const colaboradores = colaboradoresRaw.map((col) => ({
    id: col.id,
    matricula: col.matricula,
    nomeCompleto: col.nomeCompleto,
    emailCorporativo: col.emailCorporativo,
    status: col.status,
    dataAdmissao: col.dataAdmissao,
    createdAt: col.createdAt,
    avatarUrl: col.avatarUrl,
    fotoUrl: col.fotoUrl,
    cargo: col.cargo?.id && col.cargo?.titulo ? col.cargo : null,
    departamento: col.departamento?.id && col.departamento?.nome ? col.departamento : null,
    unidade: col.unidade?.id && col.unidade?.nome ? col.unidade : null,
  }));

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(colaboradoresTable)
    .where(whereClause);

  const total = totalResult?.count || 0;

  return {
    success: true,
    data: colaboradores,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

