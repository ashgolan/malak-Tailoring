import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { userRouter } from "./routes/user.routes.js";
import { saleRouter } from "./routes/sale.routes.js";
import { bouncedCheckRouter } from "./routes/bouncedCheck.routes.js";
import { workerExpensesRouter } from "./routes/workerExpenses.routes.js";
import { waybillRouter } from "./routes/waybill.routes.js";
import { partialPaymentRouter } from "./routes/partialPayment.routes.js";
import { institutionTaxRouter } from "./routes/institutionTax.routes.js";
import { saleToCompanyRouter } from "./routes/saleToCompany.routes.js";
import { expenseRouter } from "./routes/expense.routes.js";
import { sleevesBidRouter } from "./routes/sleevesBid.routes.js";
import { bidRouter } from "./routes/bid.routes.js";
import { companyRouter } from "./routes/company.routes.js";
import { inventoryRouter } from "./routes/inventory.routes.js";
import { providerRouter } from "./routes/provider.routes.js";
import { contactRouter } from "./routes/contact.routes.js";
import { taxValuesRouter } from "./routes/taxValues.routes.js";
import { eventRouter } from "./routes/event.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.use("/api/users", userRouter);
app.use("/api/sales", saleRouter);
app.use("/api/bouncedChecks", bouncedCheckRouter);
app.use("/api/workersExpenses", workerExpensesRouter);
app.use("/api/waybills", waybillRouter);
app.use("/api/partialPayment", partialPaymentRouter);
app.use("/api/institutionTax", institutionTaxRouter);
app.use("/api/salesToCompanies", saleToCompanyRouter);
app.use("/api/expenses", expenseRouter);
app.use("/api/sleevesBids", sleevesBidRouter);
app.use("/api/bids", bidRouter);
app.use("/api/companies", companyRouter);
app.use("/api/inventories", inventoryRouter);
app.use("/api/providers", providerRouter);
app.use("/api/contacts", contactRouter);
app.use("/api/taxValues", taxValuesRouter);
app.use("/api/events", eventRouter);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB - roshan-db");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
