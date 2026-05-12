import { Router } from "express";
import {
  createCompanyWithTask,
  addTask,
  updateTask,
  deleteTask,
  getAllCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/company.controller.js";
import { auth } from "../middleware/auth.middleware.js";

export const companyRouter = Router();

companyRouter.get("/", auth, getAllCompanies);
companyRouter.get("/:id", auth, getCompany);
companyRouter.post("/", auth, createCompanyWithTask);
companyRouter.put("/:id", auth, updateCompany);
companyRouter.delete("/:id", auth, deleteCompany);
companyRouter.post("/:id/tasks", auth, addTask);
companyRouter.put("/tasks/:id", auth, updateTask);
companyRouter.delete("/tasks/:id", auth, deleteTask);
