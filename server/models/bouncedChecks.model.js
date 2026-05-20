import { Schema, model } from "mongoose";

const bouncedCheckSchema = new Schema({
  date: { type: String, default: () => new Date().toISOString().split("T")[0] },
  clientName: { type: String, required: true },
  checkNumber: { type: Number, required: true },
  bankNumber: { type: Number, required: true },
  branchNumber: { type: Number, required: true },
  accountNumber: { type: Number, required: true },
  number: { type: Number, default: 0 },
  paymentDate: { type: String, default: () => new Date().toISOString().split("T")[0] },
  taxNumber: { type: String, default: "0" },
  colored: { type: Boolean, default: false },
  remark: { type: String, default: "-" },
  totalAmount: { type: Number },
});

export const BouncedCheck = model("BouncedCheck", bouncedCheckSchema);