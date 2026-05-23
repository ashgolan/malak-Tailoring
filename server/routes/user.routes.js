import { Router } from "express";
import { userControllers } from "../controllers/user.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import { loginLimiter } from "../middleware/rateLimiter.js";

export const userRouter = Router();

userRouter.post("/register", userControllers.createUser);
userRouter.post("/login", loginLimiter, userControllers.login);
userRouter.post("/logout", auth, userControllers.logout);
userRouter.post("/refresh", userControllers.refreshToken);
userRouter.post("/delete", auth, userControllers.deleteUser); // ✅ POST بدل DELETE
userRouter.get("/me", auth, userControllers.getUser);
userRouter.get("/", auth, userControllers.getAllUsers);
userRouter.put("/", auth, userControllers.updateUser);
userRouter.delete("/", auth, userControllers.deleteUser);
