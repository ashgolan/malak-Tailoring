import cron from "node-cron";
import nodemailer from "nodemailer";
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
import { User } from "../models/user.model.js";
import { Setting } from "../models/setting.model.js";

// Gmail transporter
const createTransporter = () => nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.BACKUP_EMAIL_USER,
    pass: process.env.BACKUP_EMAIL_PASS, // Gmail App Password
  },
});

// Collect all data
const collectBackupData = async () => {
  const [
    sales, bouncedChecks, workersExpenses, waybills,
    partialPayments, institutionTaxes, salesToCompanies,
    expenses, sleevesBids, bids, inventories, providers, contacts, users, settings
  ] = await Promise.all([
    Sale.find(), BouncedCheck.find(), WorkerExpenses.find(), Waybill.find(),
    PartialPayment.find(), InstitutionTax.find(), SaleToCompany.find(),
    Expense.find(), SleevesBid.find(), Bid.find(), Inventory.find(),
    Provider.find(), Contact.find(), User.find().select("-tokens -key"),
    Setting.find().select("-logoBase64") // settings without heavy logo base64
  ]);

  return {
    exportedAt: new Date().toISOString(),
    version: "2.0",
    data: {
      sales, bouncedChecks, workersExpenses, waybills,
      partialPayments, institutionTaxes, salesToCompanies,
      expenses, sleevesBids, bids, inventories, providers, contacts, users, settings
    }
  };
};

// Send backup email
export const sendBackupEmail = async () => {
  try {
    console.log("📦 Starting nightly backup...");

    const backupData = await collectBackupData();
    const json = JSON.stringify(backupData, null, 2);
    const date = new Date().toISOString().split("T")[0];

    const totalRecords = Object.values(backupData.data)
      .reduce((sum, arr) => sum + arr.length, 0);

    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"מתפרת רושאן - גיבוי" <${process.env.BACKUP_EMAIL_USER}>`,
      to: process.env.BACKUP_EMAIL_TO || process.env.BACKUP_EMAIL_USER,
      subject: `🗄️ גיבוי יומי — מתפרת רושאן — ${date}`,
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:24px;border-radius:12px;color:#fff;text-align:center;margin-bottom:20px;">
            <h1 style="margin:0;font-size:22px;">✅ גיבוי יומי הושלם</h1>
            <p style="margin:8px 0 0;opacity:0.85;font-size:14px;">מתפרת רושאן</p>
          </div>
          
          <div style="background:#f9f9f9;border-radius:10px;padding:20px;margin-bottom:16px;">
            <h3 style="margin:0 0 12px;color:#374151;">📊 פרטי הגיבוי</h3>
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <tr><td style="padding:6px 0;color:#6b7280;">תאריך:</td><td style="font-weight:600;">${date}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;">שעה:</td><td style="font-weight:600;">${new Date().toLocaleTimeString("he-IL")}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;">סה״כ רשומות:</td><td style="font-weight:600;color:#7c3aed;">${totalRecords.toLocaleString()}</td></tr>
            </table>
          </div>

          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin-bottom:16px;">
            <h4 style="margin:0 0 10px;color:#065f46;">פירוט לפי קטגוריה:</h4>
            <table style="width:100%;font-size:13px;border-collapse:collapse;">
              ${Object.entries(backupData.data).map(([key, arr]) => {
        const labels = {
          sales: "מכירות",
          bouncedChecks: "שיקים דחויים",
          workersExpenses: "הוצאות עובדים",
          waybills: "תעודות משלוח",
          partialPayments: "תשלום חלקי",
          institutionTaxes: "חשבוניות למוסדות",
          salesToCompanies: "מכירות לחברות",
          expenses: "הוצאות",
          sleevesBids: "שרוולים",
          bids: "הצעות מחיר",
          inventories: "מלאי",
          providers: "ספקים",
          contacts: "אנשי קשר",
          users: "משתמשים",
          settings: "הגדרות",
        };
        return `<tr>
                  <td style="padding:4px 0;color:#374151;">${labels[key] || key}</td>
                  <td style="text-align:left;font-weight:600;color:#059669;">${arr.length} רשומות</td>
                </tr>`;
      }).join("")}
            </table>
          </div>

          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px;font-size:12px;color:#92400e;">
            הקובץ המצורף מכיל את כל נתוני המערכת בפורמט JSON.<br/>
            לשחזור: עבור לכתובת <strong>/emergency-restore</strong> והעלה את הקובץ.
          </div>
        </div>
      `,
      attachments: [{
        filename: `roshan-backup-${date}.json`,
        content: json,
        contentType: "application/json",
      }],
    });

    console.log(`✅ Backup email sent successfully — ${totalRecords} records`);
    return true;
  } catch (err) {
    console.error("❌ Backup email failed:", err.message);
    return false;
  }
};

// Schedule nightly backup at 01:00
export const startBackupScheduler = () => {
  if (!process.env.BACKUP_EMAIL_USER || !process.env.BACKUP_EMAIL_PASS) {
    console.log("⚠️  Backup scheduler: BACKUP_EMAIL_USER or BACKUP_EMAIL_PASS not set — skipping");
    return;
  }

  // Every day at 01:00
  cron.schedule("0 1 * * *", async () => {
    console.log("🕐 Running nightly backup cron...");
    await sendBackupEmail();
  }, {
    timezone: "Asia/Jerusalem",
  });

  console.log("✅ Nightly backup scheduler started — runs at 01:00 Asia/Jerusalem");
};
