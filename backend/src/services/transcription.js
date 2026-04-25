import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import Groq from "groq-sdk";

/**
 * Transcribe un archivo de audio a texto en español.
 * Primario: Groq Whisper
 * Fallback: HuggingFace Inference API
 */
export async function transcribeAudio(filePath) {
  // Groq requiere que el archivo tenga una extensión válida
  // Multer guarda sin extensión, así que creamos un symlink/copia con extensión .webm
  const filePathWithExt = filePath + ".webm";
  fs.copyFileSync(filePath, filePathWithExt);

  try {
    // Primario: Groq (whisper-large-v3-turbo)
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(filePathWithExt),
        model: "whisper-large-v3-turbo",
        language: "es",
        response_format: "json",
      });
      console.log("Groq transcription successful");
      return transcription.text;
    } catch (groqError) {
      console.error("Groq Whisper failed:", groqError.message);
    }

    // Fallback: HuggingFace Inference API
    try {
      console.log("Trying HuggingFace fallback...");
      const audioBuffer = fs.readFileSync(filePathWithExt);

      const response = await fetch(
        "https://api-inference.huggingface.co/models/openai/whisper-large-v3",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "audio/webm",
          },
          body: audioBuffer,
        }
      );

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HuggingFace API error: ${response.status} - ${body}`);
      }

      const data = await response.json();
      const text = data.text || data[0]?.generated_text;
      if (!text) throw new Error("HuggingFace returned no text");

      console.log("HuggingFace transcription successful");
      return text;
    } catch (fallbackError) {
      console.error("HuggingFace fallback failed:", fallbackError.message);
      throw new Error("Transcription service unavailable");
    }
  } finally {
    // Limpiar el archivo con extensión
    if (fs.existsSync(filePathWithExt)) {
      fs.unlinkSync(filePathWithExt);
    }
  }
}
