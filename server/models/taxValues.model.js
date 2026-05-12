import { Schema, model } from "mongoose";

const taxValuesSchema = new Schema({
  masValue: { type: String },
  maamValue: { type: String },
});

export const TaxValues = model("TaxValues", taxValuesSchema);
