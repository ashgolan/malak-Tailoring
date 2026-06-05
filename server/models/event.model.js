import { Schema, model } from "mongoose";

const eventSchema = new Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end:   { type: Date, required: true },
}, { timestamps: true });

export const Event = model("Event", eventSchema);
