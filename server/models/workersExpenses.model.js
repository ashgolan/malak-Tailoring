import { Schema, model } from "mongoose";

const workerExpensesSchema = new Schema({
  date: { type: String, default: () => new Date().toISOString().split("T")[0] },
  location: { type: String, required: true },
  clientName: { type: String, required: true },
  equipment: { type: String, required: true },
  number: { type: Number, required: true },
  colored: { type: Boolean, default: false },
  totalAmount: { type: Number },
  tax: { type: Boolean, default: false },
}, { timestamps: true });

export const WorkerExpenses = model("WorkerExpenses", workerExpensesSchema);
