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
import bcrypt from "bcrypt";

const COLLECTIONS = {
  sales: Sale,
  bouncedChecks: BouncedCheck,
  workersExpenses: WorkerExpenses,
  waybills: Waybill,
  partialPayments: PartialPayment,
  institutionTaxes: InstitutionTax,
  salesToCompanies: SaleToCompany,
  expenses: Expense,
  sleevesBids: SleevesBid,
  bids: Bid,
  inventories: Inventory,
  providers: Provider,
  contacts: Contact,
};

// Restore from backup JSON - requires emergency key
export const restoreBackup = async (req, res) => {
  try {
    const { emergencyKey, data } = req.body;

    // Emergency key from env
    if (!emergencyKey || emergencyKey !== process.env.EMERGENCY_RESTORE_KEY) {
      return res.status(401).json({ message: "מפתח שחזור שגוי" });
    }

    if (!data) {
      return res.status(400).json({ message: "לא נשלחו נתונים לשחזור" });
    }

    const results = {};

    // Restore regular collections
    for (const [key, Model] of Object.entries(COLLECTIONS)) {
      if (data[key] && Array.isArray(data[key])) {
        const docs = data[key].map(({ _id, __v, ...rest }) => rest);
        if (docs.length > 0) {
          await Model.insertMany(docs, { ordered: false }).catch(() => { });
          results[key] = docs.length;
        }
      }
    }

    // Restore users with temp password (since password was excluded from backup)
    if (data.users && Array.isArray(data.users) && data.users.length > 0) {
      const tempHash = bcrypt.hashSync(process.env.RESTORE_TEMP_PASSWORD, 10);
      let usersRestored = 0;
      for (const user of data.users) {
        const { _id, __v, password, ...userData } = user;
        const exists = await User.findOne({ email: userData.email });
        if (!exists) {
          // Use create with direct hash to bypass pre-save middleware
          await User.collection.insertOne({ ...userData, password: tempHash });
          usersRestored++;
        }
      }
      if (usersRestored > 0) results.users = usersRestored;
    }

    return res.status(200).json({
      message: "השחזור הושלם בהצלחה",
      restored: results,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// Get restore status - no auth needed but requires emergency key
export const checkEmergencyKey = async (req, res) => {
  try {
    const { emergencyKey } = req.body;
    if (!emergencyKey || emergencyKey !== process.env.EMERGENCY_RESTORE_KEY) {
      return res.status(401).json({ message: "מפתח שגוי" });
    }
    return res.status(200).json({ message: "מפתח תקין", ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
