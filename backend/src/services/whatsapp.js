import twilio from "twilio";

/**
 * Envía una alerta de WhatsApp al tutor cuando se detecta una frase de riesgo.
 *
 * @param {string} tutorPhone - Número del tutor en formato internacional (ej: +523328202257)
 * @param {string} keyword - Frase de riesgo detectada
 * @param {string} transcription - Texto transcrito del audio
 * @param {string} txHash - Hash de la transacción en Monad Testnet
 * @returns {Promise<string>} SID del mensaje enviado
 */
export async function sendWhatsAppAlert(tutorPhone, keyword, transcription, txHash) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  // Truncar transcripción si es muy larga
  const shortTranscription =
    transcription.length > 200
      ? transcription.substring(0, 200) + "..."
      : transcription;

  const message = `⚠️ *ALERTA ALPO – Señal de riesgo detectada*

Se detectó la frase: *"${keyword}"*

📝 Transcripción:
_${shortTranscription}_

🔗 Evidencia en blockchain:
https://monad-testnet.socialscan.io/tx/${txHash}

Este mensaje fue generado automáticamente por ALPO.`;

  const result = await client.messages.create({
    from: "whatsapp:+14155238886", // Número del sandbox de Twilio
    to: `whatsapp:${tutorPhone}`,
    body: message,
  });

  console.log(`WhatsApp alert sent to ${tutorPhone}, SID: ${result.sid}`);
  return result.sid;
}
