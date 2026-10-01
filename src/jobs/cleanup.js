import cron from "node-cron";
import { pool } from "../database/db.js";

/**
 * Automatically purges document chunks older than X hours/days
 */
export function startCleanupScheduler(expirationHours = 24) {
  // Runs every hour on the hour (0 * * * *)
  cron.schedule("0 * * * *", async () => {
    console.log("[CRON] Running automatic session cleanup task...");
    try {
      const result = await pool.query(
        `
        DELETE FROM document_chunks 
        WHERE created_at < NOW() - INTERVAL '${expirationHours} hours'
        `
      );

      if (result.rowCount > 0) {
        console.log(`[CRON] Successfully purged ${result.rowCount} expired chunks.`);
      } else {
        console.log("[CRON] No expired session data found.");
      }
    } catch (error) {
      console.error("[CRON] Session cleanup job error:", error);
    }
  });

  console.log(`[CRON] Session cleanup scheduler active (Retention: ${expirationHours} hours).`);
}