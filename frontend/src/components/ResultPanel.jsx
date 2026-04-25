/**
 * Muestra el resultado del análisis de audio.
 * @param {{ result: {
 *   detected: boolean,
 *   transcription: string,
 *   keyword?: string,
 *   hash?: string,
 *   txHash?: string,
 *   timestamp?: number
 * }}} props
 */
export function ResultPanel({ result }) {
  const { detected, transcription, keyword, hash, txHash, timestamp } = result;

  /** Resalta la keyword en el texto de transcripción */
  const highlightKeyword = (text, kw) => {
    if (!kw) return text;
    const regex = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="keyword-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  /** Formatea un timestamp Unix (ms) a fecha/hora legible */
  const formatTimestamp = (ts) =>
    new Date(ts).toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "medium",
    });

  /** Copia texto al portapapeles */
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  if (!detected) {
    return (
      <div className="result-panel result-safe" role="status" aria-live="polite">
        <div className="badge badge-success">✅ Sin señales de riesgo detectadas</div>
        <div className="transcription-box">
          <h3>Transcripción</h3>
          <p>{transcription || "(sin texto detectado)"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="result-panel result-alert" role="alert" aria-live="assertive">
      <div className="banner-danger">
        ⚠️ ALERTA: Frase de riesgo detectada
      </div>

      <div className="transcription-box">
        <h3>Transcripción</h3>
        <p>{highlightKeyword(transcription, keyword)}</p>
      </div>

      <div className="evidence-section">
        <h3>Evidencia registrada en blockchain</h3>

        <div className="evidence-row">
          <span className="evidence-label">Hash:</span>
          <code className="evidence-value">0x{hash}</code>
          <button
            className="btn-copy"
            onClick={() => copyToClipboard(`0x${hash}`)}
            aria-label="Copiar hash"
            title="Copiar hash"
          >
            📋
          </button>
        </div>

        <div className="evidence-row">
          <span className="evidence-label">TX Hash:</span>
          <a
            href={`https://monad-testnet.socialscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-link"
            aria-label={`Ver transacción ${txHash} en el explorador de Monad Testnet`}
          >
            {txHash}
          </a>
        </div>

        <div className="evidence-row">
          <span className="evidence-label">Fecha/Hora:</span>
          <span className="evidence-value">{formatTimestamp(timestamp)}</span>
        </div>
      </div>

      {result.whatsappSent ? (
        <div className="badge badge-warning">📱 Tutor notificado por WhatsApp ✓</div>
      ) : (
        <div className="badge badge-warning">📱 Tutor notificado (simulado)</div>
      )}
    </div>
  );
}
