import { Schema, model } from "mongoose";

const bouncedCheckSchema = new Schema({
  date:          { type: String, default: () => new Date().toISOString().split("T")[0] },
  clientName:    { type: String, required: true },
  checkNumber:   { type: Number, default: 0 },
  bankNumber:    { type: Number, default: 0 },
  branchNumber:  { type: Number, default: 0 },
  accountNumber: { type: Number, default: 0 },
  number:        { type: Number, default: 0 },
  paymentDate:   { type: String, default: () => new Date().toISOString().split("T")[0] },
  taxNumber:     { type: String, default: "0" },
  colored:       { type: Boolean, default: false },
  remark:        { type: String, default: "-" },
  totalAmount:   { type: Number, default: 0 },
}, { timestamps: true });

export const BouncedCheck = model("BouncedCheck", bouncedCheckSchema);
