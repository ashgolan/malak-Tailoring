import { Schema, model } from "mongoose";
const date = new Date().toLocaleDateString();
const time = new Date().toLocaleTimeString();

const bidSchema = new Schema({
  clientName: { type: String, required: true },
  date: { type: String, default: date },
  time: { type: String, default: time },
  isApproved: { type: Boolean, default: false },
  target: { type: String, default: "-" },
  totalAmount: { type: Number, default: 0 },
  freeBid: { type: Boolean, required: true },
  data: { type: Array },
});

export const Bid = model("Bid", bidSchema);
