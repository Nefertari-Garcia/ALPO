import express from "express";
import multer from "multer";
import fs from "fs";
import { transcribeAudio } from "../services/transcription.js";
import { detectKeyword } from "../services/detector.js";
import { generateHash } from "../services/hasher.js";
import { storeEvidenceOnChain } from "../services/blockchain.js";
import { sendWhatsAppAlert } from "../services/whatsapp.js";
import { pool } from "../db/client.js";

const router = express.Router();
const upload = multer({ dest: "/tmp/alpo-uploads/" });

router.post("/analyze", upload.single("audio"), async (req, res) => {
  const filePath = req.file?.path;
  const tutorPhone = req.body?.tutorPhone; // número del tutor desde el frontend

  if (!filePath) {
    return res.status(400).json({ error: "No audio file received" });
  }

  try {
    // 1. Transcribir audio
    const transcription = await transcribeAudio(filePath);

    // 2. Detectar keyword de riesgo
    const keyword = detectKeyword(transcription);

    // 3. Sin detección → respuesta limpia
    if (!keyword) {
      return res.json({ detected: false, transcription });
    }

    // 4. Construir payload y generar hash SHA-256
    const timestamp = Date.now();
    const payload = { transcription, timestamp, keyword };
    const hash = generateHash(payload);

    // 5. Registrar en blockchain (Monad Testnet)
    let txHash;
    try {
      txHash = await storeEvidenceOnChain(hash, timestamp);
    } catch (blockchainError) {
      console.error("Blockchain error:", blockchainError);
      return res.status(502).json({
        error: `Blockchain registration failed: ${blockchainError.message}`,
      });
    }

    // 6. Persistir en PostgreSQL
    try {
      await pool.query(
        `INSERT INTO evidence_logs
         (transcription, keyword_detected, evidence_hash, tx_hash, timestamp)
         VALUES ($1, $2, $3, $4, $5)`,
        [transcription, keyword, hash, txHash, timestamp]
      );
    } catch (dbError) {
      console.error("Database error (evidence already on chain):", dbError);
      return res.status(500).json({
        error: `Database error: ${dbError.message}`,
      });
    }

    // 7. Enviar alerta por WhatsApp al tutor (si se proporcionó número)
    let whatsappSent = false;
    if (tutorPhone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        // Normalizar número: agregar +52 si es número mexicano de 10 dígitos
        let normalizedPhone = tutorPhone.replace(/\s+/g, "").replace(/-/g, "");
        if (!normalizedPhone.startsWith("+")) {
          normalizedPhone = "+52" + normalizedPhone;
        }
        await sendWhatsAppAlert(normalizedPhone, keyword, transcription, txHash);
        whatsappSent = true;
      } catch (whatsappError) {
        // No fallar el request si WhatsApp falla — solo loguear
        console.error("WhatsApp alert failed (non-critical):", whatsappError.message);
      }
    }

    // 8. Respuesta exitosa con evidencia completa
    return res.json({
      detected: true,
      transcription,
      keyword,
      hash,
      txHash,
      timestamp,
      whatsappSent,
    });
  } catch (err) {
    console.error("Analyze error:", err);
    if (err.message === "Transcription service unavailable") {
      return res.status(503).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  } finally {
    // Siempre limpiar el archivo temporal
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.warn("Could not delete temp file:", cleanupError.message);
      }
    }
  }
});

export default router;
