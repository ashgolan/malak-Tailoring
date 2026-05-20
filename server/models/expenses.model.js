import { Schema, model } from "mongoose";

const expenseSchema = new Schema({
  date: { type: String, default: () => new Date().toISOString().split("T")[0] },
  name: { type: String, required: true },
  number: { type: Number, default: 0 },
  paymentDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
  colored: { type: Boolean, default: false },
  taxNumber: { type: String, default: "0" },
  tax: { type: Boolean, default: false },
  totalAmount: { type: Number },
});

export const Expense = model("Expense", expenseSchema);