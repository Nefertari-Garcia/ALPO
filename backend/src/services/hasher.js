import crypto from "crypto";

/**
 * Genera un hash SHA-256 del payload de evidencia.
 *
 * @param {{ transcription: string, timestamp: number, keyword: string }} payload
 * @returns {string} String hexadecimal de exactamente 64 caracteres
 */
export function generateHash(payload) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}
