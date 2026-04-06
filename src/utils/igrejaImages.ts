import { ImageSource } from "expo-image";

/**
 * Mapeamento de caminhos do Supabase (imagem_url) para assets locais.
 * No banco (Supabase), o campo imagem_url armazena caminhos como "igrejas/fachadasede.jpg"
 * (sem barra inicial). No app, precisamos de require() estático.
 */
const imageMap: Record<string, ImageSource> = {
  "igrejas/beira.jpeg": require("../../assets/igrejas/beira.jpeg"),
  "igrejas/cajamar.jpeg": require("../../assets/igrejas/cajamar.jpeg"),
  "igrejas/campinas.jpeg": require("../../assets/igrejas/campinas.jpeg"),
  "igrejas/campo gerais.jpeg": require("../../assets/igrejas/campo-gerais.jpeg"),
  "igrejas/cotia.jpeg": require("../../assets/igrejas/cotia.jpeg"),
  "igrejas/Embu Entrada.jpg": require("../../assets/igrejas/embu-entrada.jpg"),
  "igrejas/fachadasede.jpg": require("../../assets/igrejas/fachadasede.jpg"),
  "igrejas/itapecerica da serra.jpeg": require("../../assets/igrejas/itapecerica-da-serra.jpeg"),
  "igrejas/mairipora.jpeg": require("../../assets/igrejas/mairipora.jpeg"),
  "igrejas/mocambiqueChimoio.jpeg": require("../../assets/igrejas/mocambiqueChimoio.jpeg"),
  "igrejas/mocambiquemafambisse.jpeg": require("../../assets/igrejas/mocambiquemafambisse.jpeg"),
  "igrejas/monjolinho.jpeg": require("../../assets/igrejas/monjolinho.jpeg"),
  "igrejas/orlando.jpg": require("../../assets/igrejas/orlando.jpg"),
  "igrejas/peruibe.jpeg": require("../../assets/igrejas/peruibe.jpeg"),
  "igrejas/retiro espiritual.jpeg": require("../../assets/igrejas/retiro-espiritual.jpeg"),
  "igrejas/rondoniaigreja.jpg": require("../../assets/igrejas/rondoniaigreja.jpg"),
};

/**
 * Resolve o caminho do Supabase para uma source de imagem local.
 * Retorna undefined se não encontrar correspondência.
 */
export function resolveIgrejaImage(imagemUrl: string | null): ImageSource | undefined {
  if (!imagemUrl) return undefined;
  return imageMap[imagemUrl];
}
