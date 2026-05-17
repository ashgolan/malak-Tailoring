import { Router } from "express";
import { getMySettings, updateMySettings, updateSecuritySettings, exportBackup } from "../controllers/settings.controller.js";
import { sendBackupEmail } from "../services/backupScheduler.js";
import { auth } from "../middleware/auth.middleware.js";

export const settingsRouter = Router();

settingsRouter.get("/", auth, getMySettings);
settingsRouter.put("/", auth, updateMySettings);
settingsRouter.put("/security", auth, updateSecuritySettings);
settingsRouter.get("/backup", auth, exportBackup);
settingsRouter.post("/send-backup", auth, async (req, res) => {
  const ok = await sendBackupEmail();
  if (ok) return res.json({ message: "הגיבוי נשלח בהצלחה למייל" });
  return res.status(500).json({ message: "שגיאה בשליחת הגיבוי" });
});
