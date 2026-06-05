import { Schema, model } from "mongoose";

const providerSchema = new Schema({
  name:   { type: String, required: true },
  number: { type: String, default: "-" },
  phone:  { type: String, default: "-" },
}, { timestamps: true });

export const Provider = model("Provider", providerSchema);
