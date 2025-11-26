"use server";

import { randomUUID } from "crypto";
import { db } from "@/db";
import { colaboradoresTable, marcacoesPontoTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { determineTipoMarcacao } from "@/lib/face-recognition/determine-tipo-marcacao";
import { getMarcacoesHoje } from "@/actions/get-marcacoes-hoje";
import { recognizeFaceSchema } from "./schema";

const FACE_RECOGNITION_API_URL =
  process.env.FACE_RECOGNITION_API_URL || "http://localhost:9090";

export async function recognizeFace(input: unknown) {
  try {
    console.log("🔍 Iniciando reconhecimento facial...");
    const validated = recognizeFaceSchema.parse(input);
    console.log(
      "✅ Input validado, tamanho da imagem:",
      validated.imageBase64.length
    );

    // Buscar todos os colaboradores ativos com facial cadastrada
    console.log("🔍 Buscando colaboradores ativos...");
    const colaboradores = await db
      .select({
        id: colaboradoresTable.id,
        nomeCompleto: colaboradoresTable.nomeCompleto,
        fotoUrl: colaboradoresTable.fotoUrl,
      })
      .from(colaboradoresTable)
      .where(eq(colaboradoresTable.status, "ativo"));

    console.log(`✅ Encontrados ${colaboradores.length} colaboradores ativos`);

    // Filtrar apenas os que têm fotoUrl válido
    const colaboradoresComFacial = colaboradores.filter(
      (col) => col.fotoUrl && col.fotoUrl.trim() !== ""
    );

    console.log(
      `✅ ${colaboradoresComFacial.length} colaboradores com facial cadastrada`
    );

    if (colaboradoresComFacial.length === 0) {
      return {
        success: false,
        error: "Nenhum colaborador com facial cadastrada encontrado.",
        data: null,
      };
    }

    // Preparar dados para enviar ao serviço Python
    const colaboradoresData = colaboradoresComFacial.map((col) => ({
      id: col.id,
      nome_completo: col.nomeCompleto,
      foto_url: col.fotoUrl!,
    }));

    // Chamar API Python de reconhecimento facial
    console.log("🔍 Chamando serviço Python de reconhecimento...");
    const response = await fetch(
      `${FACE_RECOGNITION_API_URL}/recognize-with-collaborators`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_base64: validated.imageBase64,
          latitude: validated.latitude,
          longitude: validated.longitude,
          dispositivo_info: validated.dispositivoInfo,
          colaboradores: colaboradoresData,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erro na API Python:", errorText);
      return {
        success: false,
        error: `Erro ao processar reconhecimento: ${response.statusText}`,
        data: null,
      };
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Colaborador não reconhecido",
        data: null,
      };
    }

    const matchedCollaborator = {
      id: result.colaborador_id,
      nomeCompleto: result.colaborador_nome,
    };

    console.log(
      `✅ Colaborador reconhecido: ${matchedCollaborator.nomeCompleto} (score: ${result.score})`
    );

    // Buscar marcações do dia
    const marcacoesResult = await getMarcacoesHoje(matchedCollaborator.id);
    const marcacoesHoje = marcacoesResult.success ? marcacoesResult.data : [];

    // Determinar tipo de marcação (sequencial: ENTRADA -> ENTRADA_ALMOCO -> VOLTA_ALMOCO -> SAIDA)
    const agora = new Date();
    const tipo = determineTipoMarcacao(marcacoesHoje);

    // Registrar ponto
    const marcacao = await db
      .insert(marcacoesPontoTable)
      .values({
        id: randomUUID(),
        colaboradorId: matchedCollaborator.id,
        tipo: tipo,
        dataHora: agora,
        metodo: "FACIAL",
        localizacaoLatitude: validated.latitude || null,
        localizacaoLongitude: validated.longitude || null,
        dispositivoInfo: validated.dispositivoInfo || null,
        status: "CONFIRMADO",
      })
      .returning();

    return {
      success: true,
      data: {
        colaborador: matchedCollaborator,
        marcacao: marcacao[0],
        tipo: tipo,
      },
      error: null,
    };
  } catch (error: any) {
    console.error("❌ Erro ao reconhecer face:", error);
    console.error("Stack trace:", error?.stack);
    return {
      success: false,
      error: error?.message || "Erro ao processar reconhecimento facial",
      data: null,
    };
  }
}
