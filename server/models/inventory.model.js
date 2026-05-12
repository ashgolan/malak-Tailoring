import { Schema, model } from "mongoose";

const inventorySchema = new Schema({
  name: { type: String, required: true },
  number: { type: Number, required: true },
});

export const Inventory = model("Inventory", inventorySchema);
