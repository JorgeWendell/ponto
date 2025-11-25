"use server";

import { db } from "@/db";
import {
  colaboradoresTable,
  cargosTable,
  departamentosTable,
  unidadesTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { updateCollaboratorSchema } from "./schema";

export async function updateCollaborator(input: unknown) {
  const validated = updateCollaboratorSchema.parse(input);

  const salaryValue = validated.salary
    ? (() => {
        const cleaned = validated.salary.replace(/[^\d,.-]/g, "");
        const normalized = cleaned.replace(",", ".");
        const parsed = parseFloat(normalized);
        return isNaN(parsed) ? null : parsed.toFixed(2);
      })()
    : null;

  let cargoId: string | null = null;
  let departamentoId: string | null = null;
  let unidadeId: string | null = null;
  let gestorId: string | null = null;

  if (validated.role) {
    const cargo = await db
      .select({ id: cargosTable.id })
      .from(cargosTable)
      .where(eq(cargosTable.titulo, validated.role))
      .limit(1);
    cargoId = cargo[0]?.id || null;
  }

  if (validated.department) {
    const departamento = await db
      .select({ id: departamentosTable.id })
      .from(departamentosTable)
      .where(eq(departamentosTable.nome, validated.department))
      .limit(1);
    departamentoId = departamento[0]?.id || null;
  }

  if (validated.unit) {
    const unidade = await db
      .select({ id: unidadesTable.id })
      .from(unidadesTable)
      .where(eq(unidadesTable.nome, validated.unit))
      .limit(1);
    unidadeId = unidade[0]?.id || null;
  }

  if (validated.manager) {
    const gestor = await db
      .select({ id: colaboradoresTable.id })
      .from(colaboradoresTable)
      .where(eq(colaboradoresTable.nomeCompleto, validated.manager))
      .limit(1);
    gestorId = gestor[0]?.id || null;
  }

  try {
    const [colaborador] = await db
      .update(colaboradoresTable)
      .set({
        matricula: validated.registration,
        cpf: validated.cpf.replace(/\D/g, ""),
        nomeCompleto: validated.name,
        dataNascimento: validated.birthDate,
        genero: validated.gender,
        estadoCivil: validated.maritalStatus,
        emailCorporativo: validated.corporateEmail,
        emailPessoal: validated.personalEmail || null,
        telefoneCelular: validated.mobilePhone.replace(/\D/g, ""),
        telefoneFixo: validated.phone ? validated.phone.replace(/\D/g, "") : null,
        cep: validated.cep.replace(/\D/g, ""),
        logradouro: validated.street,
        numero: validated.number,
        complemento: validated.complement || null,
        bairro: validated.neighborhood,
        cidade: validated.city,
        estado: validated.state,
        departamentoId,
        cargoId,
        unidadeId,
        gestorId,
        dataAdmissao: validated.admissionDate,
        tipoContrato: validated.contractType,
        regimeTrabalho: validated.workModel,
        cargaHorariaSemanal: validated.weeklyWorkload
          ? parseInt(validated.weeklyWorkload)
          : 40,
        salarioBase: salaryValue || null,
        banco: validated.bank,
        agencia: validated.agency,
        conta: validated.account,
        tipoConta: validated.accountType,
        pix: validated.pixKey || null,
        updatedAt: new Date(),
      })
      .where(eq(colaboradoresTable.id, validated.id))
      .returning();

    return { success: true, data: colaborador };
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new Error(
        "Já existe um colaborador com este CPF, matrícula ou e-mail cadastrado."
      );
    }
    throw error;
  }
}

