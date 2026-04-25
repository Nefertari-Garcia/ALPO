# ALPO – Protección Digital

Herramienta de detección temprana de señales de reclutamiento criminal en audios de menores.

## Arquitectura

```
alpo/
├── contracts/   ← Smart contract Solidity + Foundry (Monad Testnet)
├── backend/     ← Node.js + Express API
└── frontend/    ← React + Vite UI
```

---

## Setup rápido

### 1. Contratos (Foundry)

```bash
# Crear wallet del sistema
~/.foundry/bin/cast wallet new
# → Guarda la dirección y PRIVATE_KEY

# Fondear la wallet vía faucet
curl -X POST https://agents.devnads.com/v1/faucet \
  -H "Content-Type: application/json" \
  -d '{"chainId": 10143, "address": "0xTU_DIRECCION"}'
# Fallback: https://faucet.monad.xyz

# Compilar y desplegar
cd contracts
~/.foundry/bin/forge build
~/.foundry/bin/forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key 0xTU_PRIVATE_KEY \
  --broadcast
# → Anota la CONTRACT_ADDRESS del output
```

### 2. Base de datos PostgreSQL

```bash
# Crear la base de datos
createdb alpo

# Ejecutar migración
psql alpo < backend/src/db/migrations.sql
```

### 3. Backend

```bash
cd backend

# Copiar y rellenar variables de entorno
cp .env.example .env
# Editar .env con tus valores reales:
#   OPENAI_API_KEY=sk-...
#   PRIVATE_KEY=0x...         (de cast wallet new)
#   CONTRACT_ADDRESS=0x...    (del deploy)
#   DATABASE_URL=postgresql://user:password@localhost:5432/alpo

# Iniciar servidor
npm start
# → http://localhost:3001
```

### 4. Frontend

```bash
cd frontend
# .env ya tiene VITE_API_URL=http://localhost:3001

npm run dev
# → http://localhost:5173
```

---

## Variables de entorno del backend

| Variable | Descripción |
|----------|-------------|
| `OPENAI_API_KEY` | Clave de OpenAI para Whisper API |
| `HF_TOKEN` | Token de HuggingFace (fallback de transcripción) |
| `MONAD_RPC_URL` | `https://testnet-rpc.monad.xyz` |
| `PRIVATE_KEY` | Clave privada de la wallet del sistema |
| `CONTRACT_ADDRESS` | Dirección del contrato desplegado |
| `DATABASE_URL` | Cadena de conexión PostgreSQL |
| `PORT` | Puerto del servidor (default: 3001) |
| `FRONTEND_URL` | URL del frontend para CORS (default: http://localhost:5173) |

---

## Criterios de éxito del demo

- ✅ Grabar o subir audio desde el navegador
- ✅ Transcripción automática al español
- ✅ Audio con "dinero fácil" → alerta roja + evidencia blockchain
- ✅ txHash clickeable hacia el explorador de Monad Testnet
- ✅ Transacción verificable en explorador público
- ✅ Audio sin la frase → badge verde "Sin riesgo"
- ✅ Sin errores no manejados en la UI

## Exploradores Monad Testnet

- https://monad-testnet.socialscan.io
- https://testnet.monadvision.com
- https://testnet.monadscan.com
