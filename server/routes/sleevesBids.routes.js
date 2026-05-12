import { Router } from "express";
import { getAll, getOne, create, update, remove } from "../controllers/sleevesBids.controller.js";
import { auth } from "../middleware/auth.middleware.js";

export const sleevesBidsRouter = Router();

sleevesBidsRouter.get("/", auth, getAll);
sleevesBidsRouter.get("/:id", auth, getOne);
sleevesBidsRouter.post("/", auth, create);
sleevesBidsRouter.put("/:id", auth, update);
sleevesBidsRouter.delete("/:id", auth, remove);
