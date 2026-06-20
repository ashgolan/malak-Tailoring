import { Schema, model } from "mongoose";

const saleToCompanySchema = new Schema({
  date: { type: String, default: () => new Date().toISOString().split("T")[0] },
  clientName: { type: String, required: true },
  name: { type: String, required: true },
  kindOfWork: { type: String },
  containersNumbers: { type: String },
  sending: { type: String },
  number: { type: Number, required: true },
  afterTax: { type: Boolean, default: false },
  totalAmount: { type: Number, default: 0 },
  colored: { type: Boolean, default: false },
}, { timestamps: true });

export const SaleToCompany = model("SaleToCompany", saleToCompanySchema);
