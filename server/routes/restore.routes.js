import { Router } from "express";
import { restoreBackup, checkEmergencyKey } from "../controllers/restore.controller.js";

export const restoreRouter = Router();

// No auth - protected by emergency key only
restoreRouter.post("/check", checkEmergencyKey);
restoreRouter.post("/restore", restoreBackup);
