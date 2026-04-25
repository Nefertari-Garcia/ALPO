-- Ejecutar una vez al iniciar el proyecto
CREATE TABLE IF NOT EXISTS evidence_logs (
  id                SERIAL PRIMARY KEY,
  transcription     TEXT NOT NULL,
  keyword_detected  VARCHAR(100) NOT NULL,
  evidence_hash     CHAR(64) NOT NULL,    -- SHA-256 hex sin 0x
  tx_hash           VARCHAR(66),          -- 0x + 64 hex chars
  timestamp         BIGINT NOT NULL,      -- Unix ms
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
