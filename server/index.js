import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Logger ────────────────────────────────────────────────────
import { logger, httpLogger } from "./services/logger.js";

// ─── Middleware ────────────────────────────────────────────────
import { apiLimiter } from "./middleware/rateLimiter.js";

// ─── Routes ───────────────────────────────────────────────────
import { userRouter }            from "./routes/user.routes.js";
import { salesRouter }           from "./routes/sales.routes.js";
import { bouncedChecksRouter }   from "./routes/bouncedChecks.routes.js";
import { workersExpensesRouter } from "./routes/workersExpenses.routes.js";
import { waybillsRouter }        from "./routes/waybills.routes.js";
import { partialPaymentRouter }  from "./routes/partialPayment.routes.js";
import { institutionTaxRouter }  from "./routes/institutionTax.routes.js";
import { salesToCompaniesRouter } from "./routes/salesToCompanies.routes.js";
import { expensesRouter }        from "./routes/expenses.routes.js";
import { sleevesBidsRouter }     from "./routes/sleevesBids.routes.js";
import { bidsRouter }            from "./routes/bids.routes.js";
import { companyRouter }         from "./routes/company.routes.js";
import { inventoriesRouter }     from "./routes/inventories.routes.js";
import { providersRouter }       from "./routes/providers.routes.js";
import { contactsRouter }        from "./routes/contacts.routes.js";
import { taxValuesRouter }       from "./routes/taxValues.routes.js";
import { eventsRouter }          from "./routes/events.routes.js";
import { settingsRouter }        from "./routes/settings.routes.js";
import { restoreRouter }         from "./routes/restore.routes.js";
import { startBackupScheduler }  from "./services/backupScheduler.js";

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Security Headers ──────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// ─── CORS ──────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGIN || "")
  .split(",").map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin غير مسموح به — ${origin}`));
  },
  credentials: true,
}));

// ─── Body Parser ───────────────────────────────────────────────
app.use(express.json({ limit: "5mb" }));

// ─── HTTP Logger (Morgan → Winston) ───────────────────────────
app.use(httpLogger);

// ─── Rate Limiter ──────────────────────────────────────────────
app.use("/api", apiLimiter);

// ─── Static Files ──────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Routes ───────────────────────────────────────────────────
app.use("/api/users",            userRouter);
app.use("/api/sales",            salesRouter);
app.use("/api/bouncedChecks",    bouncedChecksRouter);
app.use("/api/workersExpenses",  workersExpensesRouter);
app.use("/api/waybills",         waybillsRouter);
app.use("/api/partialPayment",   partialPaymentRouter);
app.use("/api/institutionTax",   institutionTaxRouter);
app.use("/api/salesToCompanies", salesToCompaniesRouter);
app.use("/api/expenses",         expensesRouter);
app.use("/api/sleevesBids",      sleevesBidsRouter);
app.use("/api/bids",             bidsRouter);
app.use("/api/companies",        companyRouter);
app.use("/api/inventories",      inventoriesRouter);
app.use("/api/providers",        providersRouter);
app.use("/api/contacts",         contactsRouter);
app.use("/api/taxValues",        taxValuesRouter);
app.use("/api/events",           eventsRouter);
app.use("/api/settings",         settingsRouter);
app.use("/api/emergency",        restoreRouter);

// ─── Global Error Handler ──────────────────────────────────────
// يجب أن يكون بعد كل الـ routes
app.use((err, req, res, next) => {
  const status  = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === "production"
    ? "حدث خطأ في السيرفر"
    : err.message || "Internal Server Error";

  logger.error(`${status} — ${err.message}`, {
    method: req.method,
    url:    req.originalUrl,
    stack:  err.stack,
  });

  res.status(status).json({ error: message });
});

// ─── MongoDB + Server Start ────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    logger.info("✅ Connected to MongoDB — malak-db");
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      startBackupScheduler();
    });
  })
  .catch((err) => {
    logger.error("❌ MongoDB connection error", { error: err.message });
    process.exit(1);
  });
