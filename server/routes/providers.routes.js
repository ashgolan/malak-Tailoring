import { Router } from "express";
import { createCrudController } from "../controllers/crudController.js";
import { Provider } from "../models/provider.model.js";
import { auth } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validate.middleware.js";

const { getAll, getOne, create, update, remove } = createCrudController(Provider);
export const providersRouter = Router();

providersRouter.get("/",       auth,                           getAll);
providersRouter.get("/:id",    auth,                           getOne);
providersRouter.post("/",      auth, validate(schemas.contact), create);
providersRouter.put("/:id",    auth, validate(schemas.contact), update);
providersRouter.delete("/:id", auth,                            remove);
