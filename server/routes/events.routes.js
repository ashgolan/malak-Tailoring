import { Router } from "express";
import { getAll, getOne, create, update, remove } from "../controllers/events.controller.js";
import { auth } from "../middleware/auth.middleware.js";

export const eventsRouter = Router();

eventsRouter.get("/", auth, getAll);
eventsRouter.get("/:id", auth, getOne);
eventsRouter.post("/", auth, create);
eventsRouter.put("/:id", auth, update);
eventsRouter.delete("/:id", auth, remove);
