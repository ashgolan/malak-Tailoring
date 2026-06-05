import { Router } from "express";
import { createCrudController } from "../controllers/crudController.js";
import { InstitutionTax } from "../models/institutionTax.model.js";
import { auth } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validate.middleware.js";

const { getAll, getOne, create, update, remove } = createCrudController(InstitutionTax);
export const institutionTaxRouter = Router();

institutionTaxRouter.get("/",       auth,                                    getAll);
institutionTaxRouter.get("/:id",    auth,                                    getOne);
institutionTaxRouter.post("/",      auth, validate(schemas.institutionTax),  create);
institutionTaxRouter.put("/:id",    auth, validate(schemas.institutionTax),  update);
institutionTaxRouter.patch("/:id",  auth,                                    update);
institutionTaxRouter.delete("/:id", auth,                                    remove);
