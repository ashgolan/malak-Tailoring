import { Schema, model } from "mongoose";

const waybillSchema = new Schema({
  date: { type: String, default: () => new Date().toISOString().split("T")[0] },
  location: { type: String, required: true },
  clientName: { type: String, required: true },
  name: { type: String, required: true },
  remark: { type: String, required: true },
  colored: { type: Boolean, default: false },
  quantity: { type: Number, required: true },
  totalAmount: { type: Number },
});

export const Waybill = model("Waybill", waybillSchema);