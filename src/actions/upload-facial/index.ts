"use server";

import { db } from "@/db";
import { colaboradoresTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nextcloudClient } from "@/lib/nextcloud/client";
import {
  ensureDirectoryExists,
  getCollaboratorPath,
  getFacialPath,
  getFileUrl,
  sanitizeFileName,
} from "@/lib/nextcloud/utils";

export async function uploadFacial(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    const collaboratorId = formData.get("collaboratorId") as string | null;

    if (!file) {
      return { 
        success: false, 
        error: "Arquivo é obrigatório",
        url: null 
      };
    }

    if (!collaboratorId) {
      return { 
        success: false, 
        error: "ID do colaborador é obrigatório",
        url: null 
      };
    }

    if (!file.type.startsWith("image/")) {
      return { 
        success: false, 
        error: "Apenas arquivos de imagem são permitidos",
        url: null 
      };
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { 
        success: false, 
        error: "Arquivo muito grande. Tamanho máximo: 5MB",
        url: null 
      };
    }

    const collaboratorPath = getCollaboratorPath(collaboratorId);
    await ensureDirectoryExists(collaboratorPath);

    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "jpg";
    const sanitizedName = sanitizeFileName(`facial_${timestamp}.${extension}`);
    const filePath = getFacialPath(collaboratorId, sanitizedName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await nextcloudClient.putFileContents(filePath, buffer, {
      overwrite: true,
    });

    const fileUrl = getFileUrl(filePath);

    await db
      .update(colaboradoresTable)
      .set({
        fotoUrl: fileUrl,
        updatedAt: new Date(),
      })
      .where(eq(colaboradoresTable.id, collaboratorId));

    return { 
      success: true, 
      url: fileUrl,
      error: null 
    };
  } catch (error: any) {
    console.error("Erro ao fazer upload da facial:", error);
    const errorMessage = error?.message || error?.toString() || "Erro ao fazer upload da facial";
    return { 
      success: false, 
      error: errorMessage,
      url: null 
    };
  }
}

