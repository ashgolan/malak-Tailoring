import { Router } from "express";
import { createCrudController } from "../controllers/crudController.js";
import { PartialPayment } from "../models/partialPayment.model.js";
import { auth } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validate.middleware.js";

const { getAll, getOne, create, update, remove } = createCrudController(PartialPayment);
export const partialPaymentRouter = Router();

partialPaymentRouter.get("/",       auth,                                          getAll);
partialPaymentRouter.get("/:id",    auth,                                          getOne);
partialPaymentRouter.post("/",      auth, validate(schemas.partialPayment),        create);
partialPaymentRouter.put("/:id",    auth, validate(schemas.partialPaymentUpdate),  update);
partialPaymentRouter.patch("/:id",  auth,                                          update);
partialPaymentRouter.delete("/:id", auth,                                          remove);