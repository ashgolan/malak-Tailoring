import { Router } from "express";
import { createCrudController } from "../controllers/crudController.js";
import { Sale } from "../models/sale.model.js";
import { auth } from "../middleware/cookieAuth.middleware.js";
import { validate, schemas } from "../middleware/validate.middleware.js";

const { getAll, getOne, create, update, remove } = createCrudController(Sale);
export const salesRouter = Router();

salesRouter.get("/",       auth,                         getAll);
salesRouter.get("/:id",    auth,                         getOne);
salesRouter.post("/",      auth, validate(schemas.sale), create);
salesRouter.put("/:id",    auth, validate(schemas.sale), update);
salesRouter.patch("/:id",  auth,                         update); // ← للـ toggleColor بدون validation
salesRouter.delete("/:id", auth,                         remove);
