import { pool } from "./db.js";
try {
  const result = await pool.query("SELECT NOW()");
  console.log("Database connected successfully!");
  console.log("Current time from DB:", result.rows[0].now);
} catch (error) {
  console.error("Error connecting to database:", error);
}