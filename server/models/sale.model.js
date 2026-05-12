import { Schema, model } from "mongoose";
const date = new Date();
const year = date.getFullYear();
const month =
  date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

const saleSchema = new Schema({
  date: { type: String, default: year + "-" + month + "-" + day },
  clientName: { type: String, required: true },
  remark: { type: String, default: "-" },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  number: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  sale: { type: Number, default: 0 },
  expenses: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  tax: { type: Boolean, default: false },
  colored: { type: Boolean, default: false },
});

export const Sale = model("Sale", saleSchema);
