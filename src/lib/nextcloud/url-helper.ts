/**
 * Converte URLs do Nextcloud para URLs acessíveis pelo navegador
 * Se a URL já for uma URL da API proxy, retorna como está
 * Se for uma URL WebDAV, converte para URL da API proxy
 */
export function getAccessibleImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  // Se já for uma URL da API proxy, retorna como está
  if (url.includes("/api/nextcloud/image")) {
    return url;
  }

  // Se for uma URL WebDAV, extrai o path e converte
  const webdavPattern = /\/remote\.php\/dav\/files\/[^/]+\/(.+)$/;
  const match = url.match(webdavPattern);
  
  if (match) {
    const filePath = match[1];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    return `${baseUrl}/api/nextcloud/image?path=${encodeURIComponent(filePath)}`;
  }

  // Se não for nenhum dos casos acima, retorna a URL original
  return url;
}

