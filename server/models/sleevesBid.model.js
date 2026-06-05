import { Schema, model } from "mongoose";

const sleevesBidSchema = new Schema({
  date:        { type: String, default: () => new Date().toISOString().split("T")[0] },
  clientName:  { type: String, required: true },
  number:      { type: Number, default: 0 },
  quantity:    { type: Number, required: true },
  tax:         { type: Boolean, default: false },
  totalAmount: { type: Number, default: 0 },
  colored:     { type: Boolean, default: false },  // ✅ إضافة colored
}, { timestamps: true });

export const SleevesBid = model("SleevesBid", sleevesBidSchema);
