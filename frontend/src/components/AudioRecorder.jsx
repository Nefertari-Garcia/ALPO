import { useState, useRef } from "react";

/**
 * Componente para grabar audio desde el micrófono del navegador.
 * @param {{ onAudioReady: (blob: Blob) => void, onError: (msg: string) => void }} props
 */
export function AudioRecorder({ onAudioReady, onError }) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onAudioReady(blob);
        // Liberar el micrófono
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      const msg =
        err.name === "NotAllowedError"
          ? "Acceso al micrófono denegado. Por favor, permite el acceso en tu navegador."
          : `Error al acceder al micrófono: ${err.message}`;
      onError?.(msg);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="audio-recorder">
      <button
        onClick={recording ? stopRecording : startRecording}
        className={recording ? "btn btn-danger" : "btn btn-primary"}
        aria-label={recording ? "Detener grabación" : "Iniciar grabación de audio"}
      >
        {recording ? "⏹ Detener grabación" : "🎙 Grabar Audio"}
      </button>
      {recording && (
        <span className="recording-indicator" aria-live="polite">
          🔴 Grabando...
        </span>
      )}
    </div>
  );
}
