import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

/**
 * auth middleware — موحّد لكل الـ routes
 * يقرأ الـ token من Authorization header فقط
 * (الـ cookieAuth.middleware.js لم يُستخدم — احتفظ به كمرجع فقط)
 */
export const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) throw new Error("No token provided");

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findOne({
      _id: decoded._id,
      "tokens.accessToken": token,
    });

    if (!user) throw new Error("User not found");
    if (user.isBlocked) throw new Error("User is blocked");

    req.user  = user;
    req.token = token;
    next();
  } catch {
    res.status(401).json({ error: "Please authenticate." });
  }
};
