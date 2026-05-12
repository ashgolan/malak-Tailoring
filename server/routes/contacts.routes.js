import { Router } from "express";
import { getAll, getOne, create, update, remove } from "../controllers/contacts.controller.js";
import { auth } from "../middleware/auth.middleware.js";

export const contactsRouter = Router();

contactsRouter.get("/", auth, getAll);
contactsRouter.get("/:id", auth, getOne);
contactsRouter.post("/", auth, create);
contactsRouter.put("/:id", auth, update);
contactsRouter.delete("/:id", auth, remove);
