import cron from "node-cron";
import { sendBackupEmail } from "./backupService.js";

export const startBackupScheduler = () => {
  if (!process.env.BACKUP_EMAIL_USER || !process.env.BACKUP_EMAIL_PASS) {
    console.log("⚠️  Backup scheduler: email not configured — skipping");
    return;
  }
  cron.schedule("0 1 * * *", async () => {
    console.log("🕐 Running nightly backup...");
    await sendBackupEmail();
  }, { timezone: "Asia/Jerusalem" });

  console.log("✅ Nightly backup scheduler started — 01:00 Asia/Jerusalem");
};