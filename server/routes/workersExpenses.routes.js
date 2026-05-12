import { Router } from "express";
import { getAll, getOne, create, update, remove } from "../controllers/workersExpenses.controller.js";
import { auth } from "../middleware/auth.middleware.js";

export const workersExpensesRouter = Router();

workersExpensesRouter.get("/", auth, getAll);
workersExpensesRouter.get("/:id", auth, getOne);
workersExpensesRouter.post("/", auth, create);
workersExpensesRouter.put("/:id", auth, update);
workersExpensesRouter.delete("/:id", auth, remove);
