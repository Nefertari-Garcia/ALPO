import fs from "fs";
import path from "path";
import FormData from "form-data";
import fetch from "node-fetch";
import Groq from "groq-sdk";

/**
 * Transcribe un archivo de audio a texto en español.
 * Primario: Groq Whisper
 * Fallback: HuggingFace Inference API
 */
export async function transcribeAudio(filePath) {
  // Groq requiere extensión en el archivo
  const filePathWithExt = filePath + ".webm";
  fs.copyFileSync(filePath, filePathWithExt);

  try {
    // Primario: Groq usando node-fetch directamente (evita problema de File global)
    try {
      const form = new FormData();
      form.append("file", fs.createReadStream(filePathWithExt), {
        filename: "audio.webm",
        contentType: "audio/webm",
      });
      form.append("model", "whisper-large-v3-turbo");
      form.append("language", "es");
      form.append("response_format", "json");

      const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          ...form.getHeaders(),
        },
        body: form,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${body}`);
      }

      const data = await response.json();
      console.log("Groq transcription successful");
      return data.text;
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
    if (fs.existsSync(filePathWithExt)) {
      fs.unlinkSync(filePathWithExt);
    }
  }
}
