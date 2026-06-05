import { Router } from "express";
import { createCrudController } from "../controllers/crudController.js";
import { BouncedCheck } from "../models/bouncedChecks.model.js";
import { auth } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validate.middleware.js";

const { getAll, getOne, create, update, remove } = createCrudController(BouncedCheck);
export const bouncedChecksRouter = Router();

bouncedChecksRouter.get("/",       auth,                                  getAll);
bouncedChecksRouter.get("/:id",    auth,                                  getOne);
bouncedChecksRouter.post("/",      auth, validate(schemas.bouncedCheck),  create);
bouncedChecksRouter.put("/:id",    auth, validate(schemas.bouncedCheck),  update);
bouncedChecksRouter.patch("/:id",  auth,                                  update);  // toggleColor
bouncedChecksRouter.delete("/:id", auth,                                  remove);
