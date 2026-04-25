import { useState } from "react";
import { AudioRecorder } from "./components/AudioRecorder";
import { FileUploader } from "./components/FileUploader";
import { ResultPanel } from "./components/ResultPanel";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function App() {
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioName, setAudioName] = useState(null);
  const [tutorPhone, setTutorPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAudioReady = (blob) => {
    setAudioBlob(blob);
    setAudioName("recording.webm");
    setResult(null);
    setError(null);
  };

  const handleFileSelected = (file) => {
    setAudioBlob(file);
    setAudioName(file.name);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;

    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append("audio", audioBlob, audioName || "audio.webm");
    if (tutorPhone.trim()) {
      formData.append("tutorPhone", tutorPhone.trim());
    }

    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `Error del servidor (${res.status})`);
      } else {
        setResult(data);
      }
    } catch (networkError) {
      setError("Error al conectar con el servidor. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ALPO – Protección Digital</h1>
        <p className="app-subtitle">
          Analiza audio en busca de señales de riesgo
        </p>
      </header>

      <main className="app-main">
        <section className="input-section" aria-label="Captura de audio">
          <div className="input-options">
            <AudioRecorder onAudioReady={handleAudioReady} onError={setError} />
            <div className="divider" aria-hidden="true">o</div>
            <FileUploader onFileSelected={handleFileSelected} />
          </div>

          {audioName && (
            <p className="audio-ready" aria-live="polite">
              ✔ Audio listo: <strong>{audioName}</strong>
            </p>
          )}

          {/* Campo número del tutor */}
          <div className="tutor-phone-field">
            <label htmlFor="tutor-phone">
              📱 Número del tutor (WhatsApp)
            </label>
            <input
              id="tutor-phone"
              type="tel"
              placeholder="Ej: 3328202257"
              value={tutorPhone}
              onChange={(e) => setTutorPhone(e.target.value)}
              aria-label="Número de WhatsApp del tutor para recibir alertas"
            />
            <span className="phone-hint">
              Se enviará una alerta si se detecta una frase de riesgo
            </span>
          </div>

          <button
            className="btn btn-analyze"
            onClick={handleAnalyze}
            disabled={!audioBlob || loading}
            aria-busy={loading}
          >
            {loading ? "Transcribiendo y analizando..." : "Analizar"}
          </button>
        </section>

        {error && (
          <div className="error-banner" role="alert" aria-live="assertive">
            ❌ {error}
          </div>
        )}

        {result && <ResultPanel result={result} />}
      </main>
    </div>
  );
}
