import { nextcloudClient, BASE_PATH } from "./client";

export async function ensureDirectoryExists(path: string): Promise<void> {
  try {
    const exists = await nextcloudClient.exists(path);
    if (!exists) {
      await nextcloudClient.createDirectory(path, { recursive: true });
    }
  } catch (error) {
    console.error(`Erro ao criar diretório ${path}:`, error);
    throw new Error(`Falha ao criar diretório: ${path}`);
  }
}

export function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .toLowerCase();
}

export function getCollaboratorPath(collaboratorId: string): string {
  return `${BASE_PATH}/${collaboratorId}`;
}

export function getAvatarPath(collaboratorId: string, filename: string): string {
  return `${getCollaboratorPath(collaboratorId)}/avatar_${filename}`;
}

export function getFacialPath(collaboratorId: string, filename: string): string {
  return `${getCollaboratorPath(collaboratorId)}/facial_${filename}`;
}

export function getFileUrl(path: string): string {
  // Retorna URL da API que faz proxy para o Nextcloud
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/api/nextcloud/image?path=${encodeURIComponent(path)}`;
}

export function getWebDavUrl(path: string): string {
  // Retorna URL direta do WebDAV (para uso interno)
  const baseUrl = process.env.NEXTCLOUD_WEBDAV_URL || "http://192.168.15.10/remote.php/dav/files/Ponto";
  return `${baseUrl}/${path}`;
}

export function getPublicFileUrl(path: string): string {
  const baseUrl = process.env.NEXTCLOUD_PUBLIC_URL || "http://192.168.15.10";
  const publicPath = path.replace("colaboradores/", "");
  return `${baseUrl}/index.php/s/${publicPath}`;
}

/**
 * Extrai o path do Nextcloud de uma URL (seja API proxy ou WebDAV direto)
 */
export function extractNextcloudPath(url: string): string | null {
  if (!url) return null;

  // Se for URL da API proxy, extrair o path
  if (url.includes("/api/nextcloud/image?path=")) {
    const pathMatch = url.match(/path=([^&]+)/);
    return pathMatch ? decodeURIComponent(pathMatch[1]) : null;
  }

  // Se for URL WebDAV direta, extrair o path após colaboradores/
  if (url.includes("/colaboradores/")) {
    const pathAfterColab = url.split("/colaboradores/")[1];
    if (pathAfterColab) {
      return `colaboradores/${pathAfterColab.split("?")[0]}`;
    }
  }

  // Se for URL WebDAV completa, tentar extrair
  const webdavPattern = /\/remote\.php\/dav\/files\/[^/]+\/(.+)$/;
  const match = url.match(webdavPattern);
  if (match) {
    return match[1];
  }

  // Se não conseguir extrair, retornar null
  return null;
}

