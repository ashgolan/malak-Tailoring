import { Schema, model } from "mongoose";
const date = new Date();
const year = date.getFullYear();
const month =
  date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

const sleevesBidSchema = new Schema({
  date: { type: String, default: year + "-" + month + "-" + day },
  clientName: { type: String, required: true },
  number: { type: Number, default: "0" },
  quantity: { type: Number, required: true },
  tax: { type: Boolean, default: false },
  totalAmount: { type: Number },
});

export const SleevesBid = model("SleevesBid", sleevesBidSchema);
