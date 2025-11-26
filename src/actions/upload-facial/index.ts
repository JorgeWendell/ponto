"use server";

import { db } from "@/db";
import { colaboradoresTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getFileUrl } from "@/lib/nextcloud/utils";

const FACE_RECOGNITION_API_URL =
  process.env.FACE_RECOGNITION_API_URL || "http://localhost:9090";

export async function uploadFacial(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    const collaboratorId = formData.get("collaboratorId") as string | null;

    if (!file) {
      return {
        success: false,
        error: "Arquivo é obrigatório",
        url: null,
      };
    }

    if (!collaboratorId) {
      return {
        success: false,
        error: "ID do colaborador é obrigatório",
        url: null,
      };
    }

    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "Apenas arquivos de imagem são permitidos",
        url: null,
      };
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: "Arquivo muito grande. Tamanho máximo: 5MB",
        url: null,
      };
    }

    // Converter arquivo para base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";
    const fileBase64 = `data:${mimeType};base64,${base64}`;

    // Chamar API Python para fazer upload (com validação de face)
    console.log("📤 Enviando facial para validação e upload via Python...");
    const response = await fetch(`${FACE_RECOGNITION_API_URL}/upload-facial`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        colaborador_id: collaboratorId,
        image_base64: fileBase64,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erro na API Python:", errorText);
      return {
        success: false,
        error: `Erro ao processar upload: ${response.statusText}`,
        url: null,
      };
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Erro ao fazer upload de facial",
        url: null,
      };
    }

    // Converter path do Nextcloud para URL da API proxy
    const fileUrl = getFileUrl(result.url);

    // Salvar URL no banco
    await db
      .update(colaboradoresTable)
      .set({
        fotoUrl: fileUrl,
        updatedAt: new Date(),
      })
      .where(eq(colaboradoresTable.id, collaboratorId));

    console.log("✅ Facial cadastrada com sucesso:", fileUrl);

    return {
      success: true,
      url: fileUrl,
      error: null,
    };
  } catch (error: any) {
    console.error("Erro ao fazer upload da facial:", error);
    const errorMessage =
      error?.message || error?.toString() || "Erro ao fazer upload da facial";
    return {
      success: false,
      error: errorMessage,
      url: null,
    };
  }
}
