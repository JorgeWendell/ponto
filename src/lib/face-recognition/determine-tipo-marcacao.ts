import { MarcacaoPonto } from "@/db/schema";

/**
 * Determina o tipo de marcação baseado nas marcações existentes do dia e horário atual
 * 
 * Regras:
 * - ENTRADA: 07h-09h (primeira marcação do dia ou se não tem entrada ainda)
 * - ENTRADA_ALMOCO: 11h-14h (se já tem ENTRADA e não tem ENTRADA_ALMOCO)
 * - VOLTA_ALMOCO: 11h-14h (se já tem ENTRADA_ALMOCO e não tem VOLTA_ALMOCO)
 * - SAIDA: 17h-19h (se já tem ENTRADA e não tem SAIDA)
 * - Se não se encaixa em nenhuma regra, assume ENTRADA (múltiplas entradas permitidas)
 */
export function determineTipoMarcacao(
  marcacoesHoje: MarcacaoPonto[]
): "ENTRADA" | "SAIDA" | "ENTRADA_ALMOCO" | "VOLTA_ALMOCO" {
  const temEntrada = marcacoesHoje.some((m) => m.tipo === "ENTRADA");
  const temEntradaAlmoco = marcacoesHoje.some(
    (m) => m.tipo === "ENTRADA_ALMOCO"
  );
  const temVoltaAlmoco = marcacoesHoje.some(
    (m) => m.tipo === "VOLTA_ALMOCO"
  );
  const temSaida = marcacoesHoje.some((m) => m.tipo === "SAIDA");

  if (!temEntrada) {
    return "ENTRADA";
  }

  if (temEntrada && !temEntradaAlmoco) {
    return "ENTRADA_ALMOCO";
  }

  if (temEntradaAlmoco && !temVoltaAlmoco) {
    return "VOLTA_ALMOCO";
  }

  if (temEntrada && !temSaida) {
    return "SAIDA";
  }

  return "ENTRADA";
}

