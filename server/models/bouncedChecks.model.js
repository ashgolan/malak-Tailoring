import { Schema, model } from "mongoose";
const date = new Date();
const year = date.getFullYear();
const month =
  date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

const bouncedCheckSchema = new Schema({
  date: { type: String, default: year + "-" + month + "-" + day },
  clientName: { type: String, required: true },
  checkNumber: { type: Number, required: true },
  bankNumber: { type: Number, required: true },
  branchNumber: { type: Number, required: true },
  accountNumber: { type: Number, required: true },
  number: { type: Number, default: "0" },
  paymentDate: { type: String, default: year + "-" + month + "-" + day },
  taxNumber: { type: String, default: 0 },
  colored: { type: Boolean, default: false },
  remark: { type: String, default: "-" },
  totalAmount: { type: Number },
});

export const BouncedCheck = model("BouncedCheck", bouncedCheckSchema);
