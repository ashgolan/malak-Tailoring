import rateLimit from "express-rate-limit";

// حماية صفحة الـ login — 5 محاولات كل 15 دقيقة لكل IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "محاولات كثيرة جداً، حاول مجدداً بعد 15 دقيقة" },
  standardHeaders: true,
  legacyHeaders: false,
});

// حماية الـ API العام — 200 طلب كل 15 دقيقة لكل IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "طلبات كثيرة جداً، حاول لاحقاً" },
  standardHeaders: true,
  legacyHeaders: false,
});