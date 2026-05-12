import { Router } from "express";
import { getAll, getOne, create, update, remove } from "../controllers/inventories.controller.js";
import { auth } from "../middleware/auth.middleware.js";

export const inventoriesRouter = Router();

inventoriesRouter.get("/", auth, getAll);
inventoriesRouter.get("/:id", auth, getOne);
inventoriesRouter.post("/", auth, create);
inventoriesRouter.put("/:id", auth, update);
inventoriesRouter.delete("/:id", auth, remove);
