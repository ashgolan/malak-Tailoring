import { Schema, model } from "mongoose";

const taskSchema = new Schema({
  description: { type: String, required: true, unique: true },
});

export const Task = model("Task", taskSchema);
