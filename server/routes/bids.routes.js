import { Router } from "express";
import { getAll, getOne, create, update, remove } from "../controllers/bids.controller.js";
import { auth } from "../middleware/auth.middleware.js";

export const bidsRouter = Router();

bidsRouter.get("/", auth, getAll);
bidsRouter.get("/:id", auth, getOne);
bidsRouter.post("/", auth, create);
bidsRouter.put("/:id", auth, update);
bidsRouter.delete("/:id", auth, remove);
