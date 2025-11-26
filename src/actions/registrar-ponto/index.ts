"use server";

import { randomUUID } from "crypto";
import { db } from "@/db";
import { marcacoesPontoTable } from "@/db/schema";
import { registrarPontoSchema } from "./schema";

export async function registrarPonto(input: unknown) {
  try {
    const validated = registrarPontoSchema.parse(input);

    const marcacao = await db
      .insert(marcacoesPontoTable)
      .values({
        id: randomUUID(),
        colaboradorId: validated.colaboradorId,
        tipo: validated.tipo,
        dataHora: new Date(),
        metodo: validated.metodo,
        fotoCapturadaUrl: validated.fotoCapturadaUrl || null,
        localizacaoLatitude: validated.localizacaoLatitude || null,
        localizacaoLongitude: validated.localizacaoLongitude || null,
        dispositivoInfo: validated.dispositivoInfo || null,
        status: validated.metodo === "MANUAL" ? "PENDENTE" : "CONFIRMADO",
        justificativa: validated.justificativa || null,
      })
      .returning();

    return { success: true, data: marcacao[0] };
  } catch (error: any) {
    console.error("Erro ao registrar ponto:", error);
    return {
      success: false,
      error: error?.message || "Erro ao registrar ponto",
      data: null,
    };
  }
}

