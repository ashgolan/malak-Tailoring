import { Router } from "express";
import { getAll, getOne, create, update, remove } from "../controllers/partialPayment.controller.js";
import { auth } from "../middleware/auth.middleware.js";

export const partialPaymentRouter = Router();

partialPaymentRouter.get("/", auth, getAll);
partialPaymentRouter.get("/:id", auth, getOne);
partialPaymentRouter.post("/", auth, create);
partialPaymentRouter.put("/:id", auth, update);
partialPaymentRouter.delete("/:id", auth, remove);
