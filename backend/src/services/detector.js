const KEYWORDS = ["dinero fácil", "dinero facil"];

/**
 * Detecta si el texto contiene alguna keyword de riesgo.
 * La comparación es case-insensitive y diacritic-insensitive.
 *
 * @param {string|null} text - Texto a analizar (transcripción)
 * @returns {string|null} La keyword original (con tilde) si hay match, o null
 */
export function detectKeyword(text) {
  if (text == null || text === "") return null;

  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita tildes y diacríticos

  const match = KEYWORDS.find((kw) => {
    const kwNorm = kw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normalized.includes(kwNorm);
  });

  return match || null;
}
