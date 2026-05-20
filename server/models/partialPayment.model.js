import { Schema, model } from "mongoose";

const partialPaymentSchema = new Schema({
  date: { type: String, default: () => new Date().toISOString().split("T")[0] },
  clientName: { type: String, required: true },
  name: { type: String, required: true },
  number: { type: Number, default: 0 },
  advanceAmount: { type: Number, default: 0 },
  colored: { type: Boolean, default: false },
  totalAmount: { type: Number },
  payments: {
    type: [
      {
        amount: { type: Number, required: true },
        date: { type: String, default: () => new Date().toISOString().split("T")[0] },
        note: { type: String, default: "-" },
      },
    ],
    default: [],
  },
});

export const PartialPayment = model("PartialPayment", partialPaymentSchema);