import { nextcloudClient } from "@/lib/nextcloud/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get("path");

    if (!filePath) {
      return new NextResponse("Path parameter is required", { status: 400 });
    }

    const fileBuffer = await nextcloudClient.getFileContents(filePath, {
      format: "binary",
    });

    const contentType = getContentType(filePath);

    // Converter para Buffer se necessário
    const buffer = Buffer.isBuffer(fileBuffer)
      ? fileBuffer
      : Buffer.from(fileBuffer as ArrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Erro ao buscar imagem do Nextcloud:", error);
    return new NextResponse("Erro ao buscar imagem", { status: 500 });
  }
}

function getContentType(filePath: string): string {
  const extension = filePath.split(".").pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
  };
  return contentTypes[extension || ""] || "image/jpeg";
}
