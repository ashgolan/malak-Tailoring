import { Router } from "express";
import { createCrudController } from "../controllers/crudController.js";
import { WorkerExpenses } from "../models/workersExpenses.model.js";
import { auth } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validate.middleware.js";

const { getAll, getOne, create, update, remove } = createCrudController(WorkerExpenses);
export const workersExpensesRouter = Router();

workersExpensesRouter.get("/",       auth,                                    getAll);
workersExpensesRouter.get("/:id",    auth,                                    getOne);
workersExpensesRouter.post("/",      auth, validate(schemas.workerExpense),   create);
workersExpensesRouter.put("/:id",    auth, validate(schemas.workerExpense),   update);
workersExpensesRouter.patch("/:id",  auth,                                    update);
workersExpensesRouter.delete("/:id", auth,                                    remove);
