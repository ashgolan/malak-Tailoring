import { Schema, model } from "mongoose";
const date = new Date();
const year = date.getFullYear();
const month =
  date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

const waybillSchema = new Schema({
  date: { type: String, default: year + "-" + month + "-" + day },
  location: { type: String, required: true },
  clientName: { type: String, required: true },
  name: { type: String, required: true },
  remark: { type: String, required: true },
  colored: { type: Boolean, default: false },
  quantity: { type: Number, required: true },
  totalAmount: { type: Number },
});

export const Waybill = model("Waybill", waybillSchema);
