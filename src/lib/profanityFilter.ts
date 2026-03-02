// Filtro de profanidade standalone (compatível com React Native / Metro)

const PALAVRAS_PT = [
  "puta", "puto", "putaria", "putinha", "putona",
  "viado", "viadinho", "viada",
  "buceta", "boceta", "xoxota", "xereca",
  "pau", "piroca", "pica", "rola", "cacete",
  "cu", "cuzao", "cuzão",
  "merda", "bosta",
  "filho da puta", "filha da puta", "fdp",
  "vadia", "vagabunda", "vagabundo",
  "corno", "cornudo", "chifrudo",
  "caralho", "caramba",
  "porra", "porrada",
  "foda", "foder", "fudeu", "fudido", "fodase", "foda-se", "fodido",
  "desgraça", "desgraçado", "desgraçada",
  "arrombado", "arrombada",
  "otario", "otário", "otária",
  "babaca",
  "imbecil",
  "retardado", "retardada",
  "nazi", "nazista",
  "racista",
  "negro", "negra", "preto", "preta",
  "macaco", "macaca",
  "traveco",
  "sapatão", "sapatona",
];

const PALAVRAS_EN = [
  "fuck", "fucking", "fucker", "fucked", "motherfucker",
  "shit", "shitty", "bullshit",
  "ass", "asshole", "arsehole",
  "bitch", "bitches",
  "damn", "dammit",
  "dick", "dickhead",
  "cock", "cocksucker",
  "pussy", "cunt",
  "bastard",
  "whore", "slut",
  "nigga", "nigger",
  "fag", "faggot",
  "retard", "retarded",
];

const TODAS_PALAVRAS = [...PALAVRAS_PT, ...PALAVRAS_EN];

// Mapa de substituições comuns (leet speak)
const LEET_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  "$": "s",
  "!": "i",
};

function normalizarTexto(texto: string): string {
  let normalizado = texto.toLowerCase();

  // Remover acentos
  normalizado = normalizado.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Substituir leet speak
  for (const [leet, letra] of Object.entries(LEET_MAP)) {
    normalizado = normalizado.split(leet).join(letra);
  }

  // Remover caracteres repetidos (fuuuck -> fuck)
  normalizado = normalizado.replace(/(.)\1{2,}/g, "$1$1");

  // Remover separadores entre letras (f.u.c.k, f-u-c-k, f_u_c_k)
  const semSeparadores = normalizado.replace(/[.\-_\s*+]/g, "");

  return semSeparadores;
}

export function contemProfanidade(texto: string): boolean {
  const normalizado = normalizarTexto(texto);

  for (const palavra of TODAS_PALAVRAS) {
    const palavraNorm = normalizarTexto(palavra);
    if (normalizado.includes(palavraNorm)) {
      return true;
    }
  }

  return false;
}

export function censurarTexto(texto: string): string {
  let resultado = texto;

  for (const palavra of TODAS_PALAVRAS) {
    const regex = new RegExp(escapeRegex(palavra), "gi");
    resultado = resultado.replace(regex, (match) => "*".repeat(match.length));
  }

  return resultado;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
