import { Router } from "express";
import { getAll, getOne, create, update, remove } from "../controllers/bouncedChecks.controller.js";
import { auth } from "../middleware/auth.middleware.js";

export const bouncedChecksRouter = Router();

bouncedChecksRouter.get("/", auth, getAll);
bouncedChecksRouter.get("/:id", auth, getOne);
bouncedChecksRouter.post("/", auth, create);
bouncedChecksRouter.put("/:id", auth, update);
bouncedChecksRouter.delete("/:id", auth, remove);
