import rateLimit from "express-rate-limit";

// ─── Login — 5 محاولات كل 15 دقيقة لكل IP ──────────────────────
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "محاولات كثيرة جداً، حاول مجدداً بعد 15 دقيقة" },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── GET (قراءة) — 300 طلب كل 15 دقيقة ─────────────────────────
export const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: "طلبات كثيرة جداً، حاول لاحقاً" },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── POST/PUT/PATCH/DELETE (كتابة) — 100 طلب كل 15 دقيقة ───────
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "طلبات كتابة كثيرة جداً، حاول لاحقاً" },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── API العام — fallback للـ routes التي لم تُحدَّد بعد ────────
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: "طلبات كثيرة جداً، حاول لاحقاً" },
  standardHeaders: true,
  legacyHeaders: false,
});
