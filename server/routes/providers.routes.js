import { Router } from "express";
import { getAll, getOne, create, update, remove } from "../controllers/providers.controller.js";
import { auth } from "../middleware/auth.middleware.js";

export const providersRouter = Router();

providersRouter.get("/", auth, getAll);
providersRouter.get("/:id", auth, getOne);
providersRouter.post("/", auth, create);
providersRouter.put("/:id", auth, update);
providersRouter.delete("/:id", auth, remove);
