import { Router } from "express";
import { getAll, getOne, create, update, remove } from "../controllers/salesToCompanies.controller.js";
import { auth } from "../middleware/auth.middleware.js";

export const salesToCompaniesRouter = Router();

salesToCompaniesRouter.get("/", auth, getAll);
salesToCompaniesRouter.get("/:id", auth, getOne);
salesToCompaniesRouter.post("/", auth, create);
salesToCompaniesRouter.put("/:id", auth, update);
salesToCompaniesRouter.delete("/:id", auth, remove);
