import { Router } from "express";
import { createCrudController } from "../controllers/crudController.js";
import { Bid } from "../models/bid.model.js";
import { auth } from "../middleware/auth.middleware.js";
import { validate, schemas } from "../middleware/validate.middleware.js";

const { getAll, getOne, create, update, remove } = createCrudController(Bid);
export const bidsRouter = Router();

bidsRouter.get("/",       auth,                        getAll);
bidsRouter.get("/:id",    auth,                        getOne);
bidsRouter.post("/",      auth, validate(schemas.bid), create);
bidsRouter.put("/:id",    auth, validate(schemas.bid), update);
bidsRouter.patch("/:id",  auth,                        update);
bidsRouter.delete("/:id", auth,                        remove);
