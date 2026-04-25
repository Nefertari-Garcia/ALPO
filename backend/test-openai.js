import "dotenv/config";
import fetch from "node-fetch";
import fs from "fs";

console.log("OPENAI_API_KEY starts with:", process.env.OPENAI_API_KEY?.substring(0, 10));

// Test 1: conexión básica a OpenAI
try {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
  });
  console.log("OpenAI connection test:", res.status, res.ok ? "OK" : "FAILED");
} catch (e) {
  console.error("OpenAI connection error:", e.message);
}
