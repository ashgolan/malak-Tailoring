import { Router } from "express";
import { userControllers } from "../controllers/user.controller.js";
import { auth } from "../middleware/auth.middleware.js";

export const userRouter = Router();

userRouter.post("/register", userControllers.createUser);
userRouter.post("/login", userControllers.login);
userRouter.post("/logout", auth, userControllers.logout);
userRouter.post("/refresh", userControllers.refreshToken);
userRouter.get("/me", auth, userControllers.getUser);
userRouter.get("/", auth, userControllers.getAllUsers);
userRouter.put("/", auth, userControllers.updateUser);
userRouter.delete("/", auth, userControllers.deleteUser);
