import { Router } from "express";
import { getTaxValues, upsertTaxValues } from "../controllers/taxValues.controller.js";
import { auth } from "../middleware/auth.middleware.js";

export const taxValuesRouter = Router();

taxValuesRouter.get("/", auth, getTaxValues);
taxValuesRouter.post("/", auth, upsertTaxValues);
taxValuesRouter.put("/", auth, upsertTaxValues);
