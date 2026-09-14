import e from "express";
import { searchSimilarChunks } from "../../../src/retrieval/search";
import { generateAnswer } from "../../../src/generation/answer";

const router=e.Router();

router.post("/",async(req,res)=>{
try {
  const {message}=req.body;

  if(!message || !message.trim()){
    return res.status(400).json({error:"Message is required"})
  }

  console.log("\n================================");
  console.log("NEW CHAT REQUEST");
  console.log("================================");

  console.log("Question:", message);

  const chunks=await searchSimilarChunks(message,5);
  console.log(`Retrieved ${chunks.length} chunks`);

  // generate Answer

  const answer=await generateAnswer(message,chunks);
  return res.json(500).json({
    answer,
    sources: chunks.map(chunk => ({
      id: chunk.id,
      filename: chunk.filename,
      page: chunk.page,
      chunk: chunk.chunk_index,
      blockType: chunk.block_type,
      tableNumber: chunk.table_number,
      similarity: Number(
          chunk.similarity
      ),
      content: chunk.content
  }))
  })



} catch (error) {
  console.error("Chat error:",error);

  return res.status(500).json({
      error: "Failed to generate answer."
  });
}
})