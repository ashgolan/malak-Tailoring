import { Router } from "express";
import { createCrudController } from "../controllers/crudController.js";
import { Contact } from "../models/contact.model.js";
import { auth } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validate.middleware.js";

const { getAll, getOne, create, update, remove } = createCrudController(Contact);
export const contactsRouter = Router();

contactsRouter.get("/",       auth,                            getAll);
contactsRouter.get("/:id",    auth,                            getOne);
contactsRouter.post("/",      auth, validate(schemas.contact), create);
contactsRouter.put("/:id",    auth, validate(schemas.contact), update);
contactsRouter.delete("/:id", auth,                            remove);
