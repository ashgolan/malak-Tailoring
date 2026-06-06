import AdmZip from "adm-zip";
import nodemailer from "nodemailer";

import { Sale }             from "../models/sale.model.js";
import { BouncedCheck }     from "../models/bouncedChecks.model.js";
import { WorkerExpenses }   from "../models/workersExpenses.model.js";
import { Waybill }          from "../models/waybill.model.js";
import { PartialPayment }   from "../models/partialPayment.model.js";
import { InstitutionTax }   from "../models/institutionTax.model.js";
import { SaleToCompany }    from "../models/salesToCompany.model.js";
import { Expense }          from "../models/expenses.model.js";
import { SleevesBid }       from "../models/sleevesBid.model.js";
import { Bid }              from "../models/bid.model.js";
import { Inventory }        from "../models/inventory.model.js";
import { Provider }         from "../models/provider.model.js";
import { Contact }          from "../models/contact.model.js";
import { User }             from "../models/user.model.js";
import { Setting }          from "../models/setting.model.js";
import { CompanyWithTask }  from "../models/company.model.js";
import { Task }             from "../models/taskOfCompany.model.js";

const COLLECTIONS = [
  { name: "sales",            Model: Sale            },
  { name: "bouncedChecks",    Model: BouncedCheck    },
  { name: "workersExpenses",  Model: WorkerExpenses  },
  { name: "waybills",         Model: Waybill         },
  { name: "partialPayments",  Model: PartialPayment  },
  { name: "institutionTaxes", Model: InstitutionTax  },
  { name: "salesToCompanies", Model: SaleToCompany   },
  { name: "expenses",         Model: Expense         },
  { name: "sleevesBids",      Model: SleevesBid      },
  { name: "bids",             Model: Bid             },
  { name: "inventories",      Model: Inventory       },
  { name: "providers",        Model: Provider        },
  { name: "contacts",         Model: Contact         },
  { name: "tasks",            Model: Task            },
  { name: "companies",        Model: CompanyWithTask  },
  { name: "users",            Model: User            },
  { name: "settings",         Model: Setting         },
];

export async function createBackupZip() {
  const zip = new AdmZip();

  const meta = {
    createdAt: new Date().toISOString(),
    version: "2.1",
    app: "מתפרת מלאק",
    collections: COLLECTIONS.map(c => c.name),
  };
  zip.addFile("meta.json", Buffer.from(JSON.stringify(meta, null, 2)));

  for (const { name, Model } of COLLECTIONS) {
    const data = await Model.find().lean();
    zip.addFile(`${name}.json`, Buffer.from(JSON.stringify(data, null, 2)));
  }

  return zip.toBuffer();
}

export async function restoreFromZip(zipBuffer) {
  const results = {};
  const zip = new AdmZip(zipBuffer);
  const dataMap = {};

  for (const entry of zip.getEntries()) {
    if (entry.entryName === "meta.json") continue;
    const name = entry.entryName.replace(".json", "");
    dataMap[name] = JSON.parse(entry.getData().toString());
  }

  for (const { name, Model } of COLLECTIONS) {
    if (!dataMap[name]) { results[name] = 0; continue; }
    const docs = dataMap[name];

    if (name === "users" && docs.length === 0) {
      results[name] = 0;
      continue;
    }

    await Model.deleteMany({});

    if (docs.length > 0) {
      try {
        await Model.insertMany(docs, { ordered: false });
      } catch (e) {}
      results[name] = await Model.countDocuments();
    } else {
      results[name] = 0;
    }
  }

  return results;
}

export async function sendBackupEmail() {
  try {
    const zipBuffer = await createBackupZip();

    const date = new Date().toLocaleDateString("he-IL", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.BACKUP_EMAIL_USER,
        pass: process.env.BACKUP_EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"מתפרת מלאק - גיבוי" <${process.env.BACKUP_EMAIL_USER}>`,
      to: process.env.BACKUP_EMAIL_TO || process.env.BACKUP_EMAIL_USER,
      subject: `💾 גיבוי אוטומטי — מתפרת מלאק | ${date}`,
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;">
          <h2 style="color:#7c3aed;">✂️ מתפרת מלאק</h2>
          <p>גיבוי אוטומטי מתאריך ${date}</p>
          <p style="color:#6b7280;font-size:12px;">לשחזור: הגדרות ← שחזור גיבוי ← העלה את הקובץ המצורף</p>
        </div>
      `,
      attachments: [{
        filename: `malak-backup-${new Date().toISOString().split("T")[0]}.zip`,
        content: zipBuffer,
        contentType: "application/zip",
      }],
    });

    return true;
  } catch (err) {
    console.error("❌ Backup failed:", err.message);
    return false;
  }
}
