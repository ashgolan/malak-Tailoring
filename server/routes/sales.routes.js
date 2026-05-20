import { Router } from "express";
import { createCrudController } from "../controllers/crudController.js";
import { Sale } from "../models/sale.model.js";
import { auth } from "../middleware/auth.middleware.js";

const { getAll, getOne, create, update, remove } = createCrudController(Sale);
export const salesRouter = Router();

salesRouter.get("/", auth, getAll);
salesRouter.get("/:id", auth, getOne);
salesRouter.post("/", auth, create);
salesRouter.put("/:id", auth, update);
salesRouter.delete("/:id", auth, remove);