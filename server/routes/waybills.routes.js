import { Router } from "express";
import { getAll, getOne, create, update, remove } from "../controllers/waybills.controller.js";
import { auth } from "../middleware/auth.middleware.js";

export const waybillsRouter = Router();

waybillsRouter.get("/", auth, getAll);
waybillsRouter.get("/:id", auth, getOne);
waybillsRouter.post("/", auth, create);
waybillsRouter.put("/:id", auth, update);
waybillsRouter.delete("/:id", auth, remove);
