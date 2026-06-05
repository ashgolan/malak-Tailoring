import { Router } from "express";
import { createCrudController } from "../controllers/crudController.js";
import { SaleToCompany } from "../models/salesToCompany.model.js";
import { auth } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validate.middleware.js";

const { getAll, getOne, create, update, remove } = createCrudController(SaleToCompany);
export const salesToCompaniesRouter = Router();

salesToCompaniesRouter.get("/",       auth,                                   getAll);
salesToCompaniesRouter.get("/:id",    auth,                                   getOne);
salesToCompaniesRouter.post("/",      auth, validate(schemas.saleToCompany),  create);
salesToCompaniesRouter.put("/:id",    auth, validate(schemas.saleToCompany),  update);
salesToCompaniesRouter.patch("/:id",  auth,                                   update);
salesToCompaniesRouter.delete("/:id", auth,                                   remove);
