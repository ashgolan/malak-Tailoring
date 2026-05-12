import { Router } from "express";
import { getAll, getOne, create, update, remove } from "../controllers/expenses.controller.js";
import { auth } from "../middleware/auth.middleware.js";

export const expensesRouter = Router();

expensesRouter.get("/", auth, getAll);
expensesRouter.get("/:id", auth, getOne);
expensesRouter.post("/", auth, create);
expensesRouter.put("/:id", auth, update);
expensesRouter.delete("/:id", auth, remove);
