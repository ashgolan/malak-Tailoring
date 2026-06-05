import { Setting } from "../models/setting.model.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";

// ─── Logo upload setup ─────────────────────────────────────────
const logoDir = path.resolve("uploads/logos");
if (!fs.existsSync(logoDir)) fs.mkdirSync(logoDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, logoDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo_${req.user._id}${ext}`);
  },
});
export const uploadLogo = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("קובץ לא תקין"));
  },
}).single("logo");

export const uploadLogoHandler = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "לא נמצא קובץ" });
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    let settings = await Setting.findOne({ createdBy: req.user._id });
    if (!settings) settings = await Setting.create({ createdBy: req.user._id });
    settings.logoUrl = logoUrl;
    await settings.save();
    return res.json({ logoUrl });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// ─── Get settings ──────────────────────────────────────────────
export const getMySettings = async (req, res) => {
  try {
    let settings = await Setting.findOne({ createdBy: req.user._id });
    if (!settings) {
      settings = await Setting.create({
        createdBy: req.user._id,
        storeName: "מתפרת מלאק",
        maamValue: "17",
        masValue: "2.5",
      });
    }
    if (!settings.maamValue) settings.maamValue = "17";
    if (!settings.masValue) settings.masValue = "2.5";
    return res.status(200).json(settings);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// ─── Update settings ───────────────────────────────────────────
export const updateMySettings = async (req, res) => {
  try {
    const {
      storeName, storePhone, storeAddress, footerText,
      logoBase64, logoUrl, bidFooter,
      maamValue, masValue,
      transportOptions, sendingOptions,
    } = req.body;

    let settings = await Setting.findOne({ createdBy: req.user._id });
    if (!settings) settings = await Setting.create({ createdBy: req.user._id });

    if (storeName !== undefined) settings.storeName = storeName?.trim() || "";
    if (storePhone !== undefined) settings.storePhone = storePhone?.trim() || "";
    if (storeAddress !== undefined) settings.storeAddress = storeAddress?.trim() || "";
    if (footerText !== undefined) settings.footerText = footerText?.trim() || "";
    if (logoBase64 !== undefined) settings.logoBase64 = logoBase64;
    if (logoUrl !== undefined) settings.logoUrl = logoUrl;
    if (bidFooter !== undefined) settings.bidFooter = bidFooter?.trim() || "";
    if (maamValue !== undefined) settings.maamValue = maamValue;
    if (masValue !== undefined) settings.masValue = masValue;
    if (transportOptions !== undefined) settings.transportOptions = transportOptions;
    if (sendingOptions !== undefined) settings.sendingOptions = sendingOptions;

    await settings.save();
    return res.status(200).json({ message: "ההגדרות נשמרו בהצלחה.", settings });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// ─── Update security ───────────────────────────────────────────
export const updateSecuritySettings = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "המשתמש לא נמצא." });
    if (!currentPassword?.trim()) return res.status(400).json({ message: "יש להזין את הסיסמה הנוכחית." });

    const rawUser = user.toObject();
    const isMatch = bcrypt.compareSync(currentPassword, rawUser.password);
    if (!isMatch) return res.status(401).json({ message: "הסיסמה הנוכחית שגויה." });

    if (!newPassword?.trim()) return res.status(400).json({ message: "יש להזין סיסמה חדשה." });
    if (newPassword.trim().length < 6) return res.status(400).json({ message: "הסיסמה החדשה חייבת להכיל לפחות 6 תווים." });

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword.trim(), salt);
    await User.findByIdAndUpdate(req.user._id, { $set: { password: hash } });
    return res.status(200).json({ message: "הסיסמה עודכנה בהצלחה." });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// ─── Backup ────────────────────────────────────────────────────
import { createBackupZip } from "../services/backupService.js";

export const exportBackup = async (req, res) => {
  try {
    const zipBuffer = await createBackupZip();
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename=malak-backup-${new Date().toISOString().split("T")[0]}.zip`);
    return res.status(200).send(zipBuffer);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
