import express from "express";
import cors from 'cors';
import chatRouter from "./src/api/chat.js";
import uploadRouter from "./src/api/router.js";
import documentRouter from "./src/api/document.js";
import { startCleanupScheduler } from "./src/jobs/cleanup.js";
import { OllamaClient } from "./src/llm/ollama_service.js";
import { pool } from "./src/database/db.js";

const app=express();
const PORT=3000;

app.use(cors());
app.use(express.json());

// ROUTES
app.get("/api/health",(req,res)=>{
  res.json({
    status:"ok"
  })
})

app.use("/api/chat",chatRouter);
app.use("/api/upload",uploadRouter);
app.use('/api/document',documentRouter);

//CRON JOB FOR CLEANUP
startCleanupScheduler(24);

//HELPER FUNCTION FOR CHECKING DB AND OLLAMA
async function checkDatabase() {
  console.log("Checking PostgreSQL...");
  try {
    await pool.query("SELECT 1");
    console.log("✅ PostgreSQL connected");
    return true;
  } catch (error) {
    console.error("❌ PostgreSQL connection failed");
    console.error(error.message);
    return false;
  }
}

async function checkOllama() {
  console.log("Checking Ollama...");
  await OllamaClient.models.list();
  console.log("✅ Ollama connected");
}

async function startServer() {
  try {
    await checkDatabase();
    await checkOllama();

    app.listen(PORT, () => {
      console.log(`RAG API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

startServer();