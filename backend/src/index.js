import "dotenv/config";
import express from "express";
import cors from "cors";
import analyzeRouter from "./routes/analyze.js";

const app = express();

app.use(cors());  // Acepta cualquier origen para el demo
app.use(express.json());
app.use("/api", analyzeRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`ALPO backend running on port ${PORT}`);
});
