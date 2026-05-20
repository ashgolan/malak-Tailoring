import { Setting } from "../models/setting.model.js";
import { User } from "../models/user.model.js";
import { Sale } from "../models/sale.model.js";
import { BouncedCheck } from "../models/bouncedChecks.model.js";
import { WorkerExpenses } from "../models/workersExpenses.model.js";
import { Waybill } from "../models/waybill.model.js";
import { PartialPayment } from "../models/partialPayment.model.js";
import { InstitutionTax } from "../models/institutionTax.model.js";
import { SaleToCompany } from "../models/salesToCompany.model.js";
import { Expense } from "../models/expenses.model.js";
import { SleevesBid } from "../models/sleevesBid.model.js";
import { Bid } from "../models/bid.model.js";
import { Inventory } from "../models/inventory.model.js";
import { Provider } from "../models/provider.model.js";
import { Contact } from "../models/contact.model.js";
import bcrypt from "bcrypt";

// Get or create settings
export const getMySettings = async (req, res) => {
  try {
    let settings = await Setting.findOne({ createdBy: req.user._id });
    if (!settings) {
      settings = await Setting.create({
        createdBy: req.user._id,
        storeName: "מתפרת רושאן",
        maamValue: "17",
        masValue: "2.5",
      });
    }
    // Ensure defaults are always returned
    if (!settings.maamValue) settings.maamValue = "17";
    if (!settings.masValue) settings.masValue = "2.5";
    return res.status(200).json(settings);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// Update general settings
export const updateMySettings = async (req, res) => {
  try {
    const { storeName, storePhone, storeAddress, footerText, logoBase64, maamValue, masValue } = req.body;
    let settings = await Setting.findOne({ createdBy: req.user._id });
    if (!settings) {
      settings = await Setting.create({ createdBy: req.user._id });
    }
    if (storeName !== undefined) settings.storeName = storeName?.trim() || "";
    if (storePhone !== undefined) settings.storePhone = storePhone?.trim() || "";
    if (storeAddress !== undefined) settings.storeAddress = storeAddress?.trim() || "";
    if (footerText !== undefined) settings.footerText = footerText?.trim() || "";
    if (logoBase64 !== undefined) settings.logoBase64 = logoBase64;
    if (maamValue !== undefined) settings.maamValue = maamValue;
    if (masValue !== undefined) settings.masValue = masValue;
    await settings.save();
    return res.status(200).json({ message: "ההגדרות נשמרו בהצלחה.", settings });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// Update security (password)
export const updateSecuritySettings = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "המשתמש לא נמצא." });
    if (!currentPassword?.trim()) return res.status(400).json({ message: "יש להזין את הסיסמה הנוכחית." });

    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "הסיסמה הנוכחית שגויה." });

    if (!newPassword?.trim()) return res.status(400).json({ message: "יש להזין סיסמה חדשה." });
    if (newPassword.trim().length < 6) return res.status(400).json({ message: "הסיסמה החדשה חייבת להכיל לפחות 6 תווים." });

    // Use findByIdAndUpdate with $set to bypass mongoose pre-save middleware
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword.trim(), salt);
    await User.findByIdAndUpdate(req.user._id, { $set: { password: hash } });

    return res.status(200).json({ message: "הסיסמה עודכנה בהצלחה." });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// Full backup - export all data as JSON
export const exportBackup = async (req, res) => {
  try {
    const backup = {
      exportedAt: new Date().toISOString(),
      version: "2.0",
      data: {
        sales: await Sale.find(),
        bouncedChecks: await BouncedCheck.find(),
        workersExpenses: await WorkerExpenses.find(),
        waybills: await Waybill.find(),
        partialPayments: await PartialPayment.find(),
        institutionTaxes: await InstitutionTax.find(),
        salesToCompanies: await SaleToCompany.find(),
        expenses: await Expense.find(),
        sleevesBids: await SleevesBid.find(),
        bids: await Bid.find(),
        inventories: await Inventory.find(),
        providers: await Provider.find(),
        contacts: await Contact.find(),
        users: await User.find().select("-tokens -key"),
        settings: await Setting.find().select("-logoBase64"),
      }
    };
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=roshan-backup-${new Date().toISOString().split("T")[0]}.json`);
    return res.status(200).json(backup);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
