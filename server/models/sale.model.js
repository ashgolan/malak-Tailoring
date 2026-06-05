import { Schema, model } from "mongoose";

const saleSchema = new Schema({
  date:        { type: String, default: () => new Date().toISOString().split("T")[0] },
  clientName:  { type: String, required: true },
  remark:      { type: String, default: "-" },
  name:        { type: String, required: true },
  quantity:    { type: Number, required: true },
  number:      { type: Number, required: true },
  discount:    { type: Number, default: 0 },
  sale:        { type: Number, default: 0 },
  expenses:    { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  tax:         { type: Boolean, default: false },
  colored:     { type: Boolean, default: false },
}, { timestamps: true });

export const Sale = model("Sale", saleSchema);
