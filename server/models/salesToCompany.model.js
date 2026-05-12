import { Schema, model } from "mongoose";
const date = new Date();
const year = date.getFullYear();
const month =
  date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

const saleToCompanySchema = new Schema({
  date: { type: String, default: year + "-" + month + "-" + day },
  clientName: { type: String, required: true },
  name: { type: String, required: true },
  kindOfWork: { type: String },
  containersNumbers: { type: String },
  sending: { type: String },
  number: { type: Number, required: true },
  afterTax: { type: String, required: true },
  totalAmount: { type: Number, default: 0 },
  colored: { type: Boolean, default: false },
});

export const SaleToCompany = model("SaleToCompany", saleToCompanySchema);
