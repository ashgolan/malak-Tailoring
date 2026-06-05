import { Router } from "express";
import { createCrudController } from "../controllers/crudController.js";
import { Inventory } from "../models/inventory.model.js";
import { auth } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validate.middleware.js";

const { getAll, getOne, create, update, remove } = createCrudController(Inventory);
export const inventoriesRouter = Router();

inventoriesRouter.get("/",       auth,                               getAll);
inventoriesRouter.get("/:id",    auth,                               getOne);
inventoriesRouter.post("/",      auth, validate(schemas.inventory),  create);
inventoriesRouter.put("/:id",    auth, validate(schemas.inventory),  update);
inventoriesRouter.delete("/:id", auth,                               remove);
