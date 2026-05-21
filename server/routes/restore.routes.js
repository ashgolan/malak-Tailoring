import { Router } from "express";
import { restoreBackup, checkEmergencyKey } from "../controllers/restore.controller.js";
import { restoreFromZip } from "../services/backupService.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export const restoreRouter = Router();

// No auth - protected by emergency key only
restoreRouter.post("/check", checkEmergencyKey);
restoreRouter.post("/restore", restoreBackup);

// ZIP restore
restoreRouter.post("/restore-zip", upload.single("file"), async (req, res) => {
  try {
    const { emergencyKey } = req.body;
    if (!emergencyKey || emergencyKey !== process.env.EMERGENCY_RESTORE_KEY)
      return res.status(401).json({ message: "מפתח שחזור שגוי" });
    if (!req.file)
      return res.status(400).json({ message: "לא נשלח קובץ" });
    const results = await restoreFromZip(req.file.buffer);
    return res.status(200).json({ message: "השחזור הושלם בהצלחה", restored: results });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
});