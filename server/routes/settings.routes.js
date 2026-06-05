import { Router } from "express";
import {
  getMySettings, updateMySettings, updateSecuritySettings,
  exportBackup, uploadLogo, uploadLogoHandler
} from "../controllers/settings.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import { sendBackupEmail } from "../services/backupService.js";

export const settingsRouter = Router();

settingsRouter.get("/", auth, getMySettings);
settingsRouter.put("/", auth, updateMySettings);
settingsRouter.put("/security", auth, updateSecuritySettings);
settingsRouter.get("/backup", auth, exportBackup);
settingsRouter.post("/upload-logo", auth, uploadLogo, uploadLogoHandler);
settingsRouter.post("/send-backup", auth, async (req, res) => {
  const ok = await sendBackupEmail();
  if (ok) return res.json({ message: "הגיבוי נשלח בהצלחה למייל" });
  return res.status(500).json({ message: "שגיאה בשליחת הגיבוי" });
});
