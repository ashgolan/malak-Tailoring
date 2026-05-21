/**
 * cookieAuth.middleware.js
 * ────────────────────────
 * استخدام httpOnly cookies بدل Authorization header
 *
 * 1. ثبّت: npm install cookie-parser  (في server)
 * 2. في index.js أضف:
 *      import cookieParser from "cookie-parser";
 *      app.use(cookieParser());
 * 3. استبدل auth.middleware.js بهذا الملف
 */

import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const auth = async (req, res, next) => {
  try {
    // قبل: token من Authorization header
    // بعد: token من httpOnly cookie
    const token =
      req.cookies?.accessToken ||          // httpOnly cookie (جديد)
      req.header("Authorization");          // fallback للـ clients القديمة

    if (!token) throw new Error("No token provided");

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.accessToken": token,
    });

    if (!user) throw new Error("User not found");
    req.user  = user;
    req.token = token;
    next();
  } catch {
    res.status(401).send({ error: "Please authenticate." });
  }
};

/**
 * setAuthCookies — استخدمها عند Login و Refresh
 *
 * @param {Response} res
 * @param {{ accessToken: string, refreshToken: string }} tokens
 */
export function setAuthCookies(res, { accessToken, refreshToken }) {
  const isProd = process.env.NODE_ENV === "production";

  // Access token — 15 دقيقة
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure:   isProd,         // HTTPS فقط في الإنتاج
    sameSite: isProd ? "strict" : "lax",
    maxAge:   15 * 60 * 1000, // 15 min
  });

  // Refresh token — 7 أيام
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
    path:     "/api/users/refresh",     // متاح فقط لـ endpoint الـ refresh
  });
}

/**
 * clearAuthCookies — استخدمها عند Logout
 */
export function clearAuthCookies(res) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken", { path: "/api/users/refresh" });
}
