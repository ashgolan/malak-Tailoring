import { Router } from "express";
import { createCrudController } from "../controllers/crudController.js";
import { Expense } from "../models/expenses.model.js";
import { auth } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validate.middleware.js";

const { getAll, getOne, create, update, remove } = createCrudController(Expense);
export const expensesRouter = Router();

expensesRouter.get("/",       auth,                            getAll);
expensesRouter.get("/:id",    auth,                            getOne);
expensesRouter.post("/",      auth, validate(schemas.expense), create);
expensesRouter.put("/:id",    auth, validate(schemas.expense), update);
expensesRouter.patch("/:id",  auth,                            update);
expensesRouter.delete("/:id", auth,                            remove);
