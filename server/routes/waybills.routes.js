import { Router } from "express";
import { createCrudController } from "../controllers/crudController.js";
import { Waybill } from "../models/waybill.model.js";
import { auth } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validate.middleware.js";

const { getAll, getOne, create, update, remove } = createCrudController(Waybill);
export const waybillsRouter = Router();

waybillsRouter.get("/",       auth,                           getAll);
waybillsRouter.get("/:id",    auth,                           getOne);
waybillsRouter.post("/",      auth, validate(schemas.waybill), create);
waybillsRouter.put("/:id",    auth, validate(schemas.waybill), update);
waybillsRouter.patch("/:id",  auth,                           update);
waybillsRouter.delete("/:id", auth,                           remove);
