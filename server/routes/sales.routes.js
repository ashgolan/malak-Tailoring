import { Router } from "express";
import { getAll, getOne, create, update, remove } from "../controllers/sale.controller.js";
import { auth } from "../middleware/auth.middleware.js";

export const salesRouter = Router();

salesRouter.get("/", auth, getAll);
salesRouter.get("/:id", auth, getOne);
salesRouter.post("/", auth, create);
salesRouter.put("/:id", auth, update);
salesRouter.delete("/:id", auth, remove);
