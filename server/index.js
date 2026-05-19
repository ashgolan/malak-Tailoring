import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";           // ← جديد
import dotenv from "dotenv";
dotenv.config();

import { apiLimiter } from "./middleware/rateLimiter.js"; // من الخطوة 2
import { userRouter } from "./routes/user.routes.js";
import { salesRouter } from "./routes/sales.routes.js";
import { bouncedChecksRouter } from "./routes/bouncedChecks.routes.js";
import { workersExpensesRouter } from "./routes/workersExpenses.routes.js";
import { waybillsRouter } from "./routes/waybills.routes.js";
import { partialPaymentRouter } from "./routes/partialPayment.routes.js";
import { institutionTaxRouter } from "./routes/institutionTax.routes.js";
import { salesToCompaniesRouter } from "./routes/salesToCompanies.routes.js";
import { expensesRouter } from "./routes/expenses.routes.js";
import { sleevesBidsRouter } from "./routes/sleevesBids.routes.js";
import { bidsRouter } from "./routes/bids.routes.js";
import { companyRouter } from "./routes/company.routes.js";
import { inventoriesRouter } from "./routes/inventories.routes.js";
import { providersRouter } from "./routes/providers.routes.js";
import { contactsRouter } from "./routes/contacts.routes.js";
import { taxValuesRouter } from "./routes/taxValues.routes.js";
import { eventsRouter } from "./routes/events.routes.js";
import { settingsRouter } from "./routes/settings.routes.js";
import { restoreRouter } from "./routes/restore.routes.js";
import { startBackupScheduler } from "./services/backupScheduler.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Helmet — 11 header أمني تلقائياً
app.use(helmet());

// ✅ CORS محدد — بدل "*"
const allowedOrigins = (process.env.ALLOWED_ORIGIN || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // السماح لطلبات بدون origin (Postman، mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin غير مسموح به — ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: "2mb" })); // ✅ حد حجم الـ body

// ✅ Rate limiting من الخطوة 2
app.use("/api", apiLimiter);

// Routes
app.use("/api/users", userRouter);
app.use("/api/sales", salesRouter);
app.use("/api/bouncedChecks", bouncedChecksRouter);
app.use("/api/workersExpenses", workersExpensesRouter);
app.use("/api/waybills", waybillsRouter);
app.use("/api/partialPayment", partialPaymentRouter);
app.use("/api/institutionTax", institutionTaxRouter);
app.use("/api/salesToCompanies", salesToCompaniesRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/sleevesBids", sleevesBidsRouter);
app.use("/api/bids", bidsRouter);
app.use("/api/companies", companyRouter);
app.use("/api/inventories", inventoriesRouter);
app.use("/api/providers", providersRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/taxValues", taxValuesRouter);
app.use("/api/events", eventsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/emergency", restoreRouter);

// ✅ Global error handler — لا يكشف stack traces للمستخدم
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = process.env.NODE_ENV === "production"
    ? "حدث خطأ في السيرفر"
    : err.message;
  res.status(status).json({ error: message });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB - roshan-db");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      startBackupScheduler();
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));