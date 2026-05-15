import { Schema, model } from "mongoose";
const date = new Date();
const year = date.getFullYear();
const month =
  date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

const partialPaymentSchema = new Schema({
  date: { type: String, default: year + "-" + month + "-" + day },
  clientName: { type: String, required: true },
  name: { type: String, required: true },
  number: { type: Number, default: "0" },
  advanceAmount: { type: Number, default: "0" },
  colored: { type: Boolean, default: false },
  totalAmount: { type: Number },
  payments: {
    type: [
      {
        amount: { type: Number, required: true },
        date: { type: String, default: year + "-" + month + "-" + day },
        note: { type: String, default: "-" },
      },
    ],
    default: [],
  },
});

export const PartialPayment = model("PartialPayment", partialPaymentSchema);
