"use server";

import { db } from "@/db";
import {
  colaboradoresTable,
  cargosTable,
  departamentosTable,
  unidadesTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCollaboratorById(id: string) {
  const [colaborador] = await db
    .select({
      id: colaboradoresTable.id,
      matricula: colaboradoresTable.matricula,
      cpf: colaboradoresTable.cpf,
      nomeCompleto: colaboradoresTable.nomeCompleto,
      nomeSocial: colaboradoresTable.nomeSocial,
      dataNascimento: colaboradoresTable.dataNascimento,
      genero: colaboradoresTable.genero,
      estadoCivil: colaboradoresTable.estadoCivil,
      // Documentos
      rg: colaboradoresTable.rg,
      orgaoExpedidor: colaboradoresTable.orgaoExpedidor,
      tituloEleitor: colaboradoresTable.tituloEleitor,
      pisPasep: colaboradoresTable.pisPasep,
      ctps: colaboradoresTable.ctps,
      serieCtps: colaboradoresTable.serieCtps,
      emailCorporativo: colaboradoresTable.emailCorporativo,
      emailPessoal: colaboradoresTable.emailPessoal,
      telefoneCelular: colaboradoresTable.telefoneCelular,
      telefoneFixo: colaboradoresTable.telefoneFixo,
      cep: colaboradoresTable.cep,
      logradouro: colaboradoresTable.logradouro,
      numero: colaboradoresTable.numero,
      complemento: colaboradoresTable.complemento,
      bairro: colaboradoresTable.bairro,
      cidade: colaboradoresTable.cidade,
      estado: colaboradoresTable.estado,
      departamentoId: colaboradoresTable.departamentoId,
      cargoId: colaboradoresTable.cargoId,
      unidadeId: colaboradoresTable.unidadeId,
      gestorId: colaboradoresTable.gestorId,
      dataAdmissao: colaboradoresTable.dataAdmissao,
      tipoContrato: colaboradoresTable.tipoContrato,
      regimeTrabalho: colaboradoresTable.regimeTrabalho,
      cargaHorariaSemanal: colaboradoresTable.cargaHorariaSemanal,
      salarioBase: colaboradoresTable.salarioBase,
      banco: colaboradoresTable.banco,
      agencia: colaboradoresTable.agencia,
      conta: colaboradoresTable.conta,
      tipoConta: colaboradoresTable.tipoConta,
      pix: colaboradoresTable.pix,
      status: colaboradoresTable.status,
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
    .where(eq(colaboradoresTable.id, id))
    .limit(1);

  if (!colaborador) {
    return { success: false, data: null };
  }

  // Buscar gestor separadamente para evitar conflito de join na mesma tabela
  let gestor = null;
  if (colaborador.gestorId) {
    const [gestorData] = await db
      .select({
        id: colaboradoresTable.id,
        nomeCompleto: colaboradoresTable.nomeCompleto,
      })
      .from(colaboradoresTable)
      .where(eq(colaboradoresTable.id, colaborador.gestorId))
      .limit(1);
    gestor = gestorData || null;
  }

  // Mapear os dados para garantir que objetos aninhados sejam tratados corretamente
  const colaboradorMapeado = {
    ...colaborador,
    cargo: colaborador.cargo?.id && colaborador.cargo?.titulo ? colaborador.cargo : null,
    departamento: colaborador.departamento?.id && colaborador.departamento?.nome ? colaborador.departamento : null,
    unidade: colaborador.unidade?.id && colaborador.unidade?.nome ? colaborador.unidade : null,
    gestor,
  };

  return { success: true, data: colaboradorMapeado };
}

