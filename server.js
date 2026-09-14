import express from "express";
import cors from 'cors';
import chatRouter from "./src/api/chat.js";

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

app.listen(PORT,()=>{
  console.log(
    `RAG API running on http://localhost:${PORT}`
  )
})