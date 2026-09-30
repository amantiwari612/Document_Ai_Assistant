import express from "express";
import cors from 'cors';
import chatRouter from "./src/api/chat.js";
import uploadRouter from "./src/api/router.js";
import documentRouter from "./src/api/document.js";

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

app.listen(PORT,()=>{
  console.log(
    `RAG API running on http://localhost:${PORT}`
  )
})