/**
 * logger.js — Winston + Morgan
 * ─────────────────────────────
 * ثبّت:  npm install winston morgan  (في server)
 *
 * الاستخدام في index.js:
 *   import { logger, httpLogger } from "./services/logger.js";
 *   app.use(httpLogger);           // قبل كل الـ routes
 *   logger.info("Server started"); // في أي مكان
 */

import winston from "winston";
import morgan  from "morgan";
import path    from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR   = path.join(__dirname, "../logs");

// ─── Winston Logger ────────────────────────────────────────────
const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) =>
  `${timestamp} [${level}]: ${stack || message}`
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    errors({ stack: true }),       // log stack traces
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    // Console — colored (dev only)
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
      silent: process.env.NODE_ENV === "test",
    }),

    // File — all logs
    new winston.transports.File({
      filename: path.join(LOG_DIR, "app.log"),
      maxsize:  5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      tailable: true,
    }),

    // File — errors only
    new winston.transports.File({
      filename: path.join(LOG_DIR, "error.log"),
      level:    "error",
      maxsize:  5 * 1024 * 1024,
      maxFiles: 3,
    }),
  ],
});

// ─── Morgan HTTP Logger ────────────────────────────────────────
const morganFormat = process.env.NODE_ENV === "production"
  ? "combined"   // Apache Combined Log Format
  : "dev";       // :method :url :status - :response-time ms

// Send morgan output → winston
const morganStream = {
  write: (message) => logger.http(message.trim()),
};

export const httpLogger = morgan(morganFormat, { stream: morganStream });

/*
 * שימוש בקבצים אחרים:
 *
 *   import { logger } from "../services/logger.js";
 *   logger.info("Backup sent successfully");
 *   logger.warn("Rate limit approaching");
 *   logger.error("DB connection failed", { error: err.message });
 */
