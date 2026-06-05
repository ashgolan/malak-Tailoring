import { Schema, model } from "mongoose";

const settingSchema = new Schema({
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  storeName: { type: String, default: "מתפרת מלאק" },
  storePhone: { type: String, default: "" },
  storeAddress: { type: String, default: "" },
  footerText: { type: String, default: "" },
  logoBase64: { type: String, default: "" },
  logoUrl: { type: String, default: "" },
  bidFooter: { type: String, default: "" },
  maamValue: { type: String, default: "17" },
  masValue: { type: String, default: "2.5" },
  transportOptions: { type: [String], default: ["טורקית", "הודית", "סינית", "אירופאית", "מקומית"] },
  sendingOptions: { type: [String], default: ["צפון", "מרכז", "דרום", "ירושלים", "שפלה"] },
}, { timestamps: true });

export const Setting = model("Setting", settingSchema);
