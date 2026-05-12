import { Schema, model } from "mongoose";

const contactSchema = new Schema({
  name: { type: String, required: true },
  number: { type: Number, default: "-" },
  mail: { type: String, default: "-" },
  bankProps: { type: String, default: "-" },
});

export const Contact = model("Contact", contactSchema);
