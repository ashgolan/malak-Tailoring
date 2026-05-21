/**
 * sales.routes.js — مع Validation
 * 
 * نفس النمط يُطبَّق على كل الـ routes الأخرى:
 *   bouncedChecks → schemas.bouncedCheck
 *   workersExpenses → schemas.workerExpense
 *   waybills → schemas.waybill
 *   partialPayment → schemas.partialPayment
 *   institutionTax → schemas.institutionTax
 *   salesToCompanies → schemas.saleToCompany
 *   expenses → schemas.expense
 *   sleevesBids → schemas.sleevesBid
 *   bids → schemas.bid
 *   inventories → schemas.inventory
 *   contacts → schemas.contact
 *   providers → schemas.contact
 *   events → schemas.event
 */
import { Router } from "express";
import { createCrudController } from "../controllers/crudController.js";
import { Sale } from "../models/sale.model.js";
import { auth } from "../middleware/cookieAuth.middleware.js";
import { validate, schemas } from "../middleware/validate.middleware.js";

const { getAll, getOne, create, update, remove } = createCrudController(Sale);
export const salesRouter = Router();

salesRouter.get("/",     auth,                           getAll);
salesRouter.get("/:id",  auth,                           getOne);
salesRouter.post("/",    auth, validate(schemas.sale),   create);
salesRouter.put("/:id",  auth, validate(schemas.sale),   update);
salesRouter.delete("/:id", auth,                         remove);
