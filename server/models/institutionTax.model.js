import { Schema, model } from "mongoose";

const institutionTaxSchema = new Schema({
  date: { type: String, default: () => new Date().toISOString().split("T")[0] },
  clientName: { type: String, required: true },
  name: { type: String, required: true },
  taxNumber: { type: String, default: "0" },
  number: { type: Number, default: 0 },
  paymentDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
  colored: { type: Boolean, default: false },
  totalAmount: { type: Number },
});

export const InstitutionTax = model("InstitutionTax", institutionTaxSchema);