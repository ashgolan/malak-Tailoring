import { Router } from "express";
import { getAll, getOne, create, update, remove } from "../controllers/institutionTax.controller.js";
import { auth } from "../middleware/auth.middleware.js";

export const institutionTaxRouter = Router();

institutionTaxRouter.get("/", auth, getAll);
institutionTaxRouter.get("/:id", auth, getOne);
institutionTaxRouter.post("/", auth, create);
institutionTaxRouter.put("/:id", auth, update);
institutionTaxRouter.delete("/:id", auth, remove);
