import { model, Schema } from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    validate(value) {
      // ✅ تحقق فقط إذا كانت القيمة ليست hash
      if (value && !value.startsWith("$2b$") && value.length < 10)
        throw Error("min length of password is 10 digits!");
    },
  },
  isBlocked: { type: Boolean, default: false },
  key: { type: String, default: "unknown" },
  tokens: [
    {
      accessToken: { type: String, required: true },
    },
  ],
  role: { type: String, required: true },
});

// ✅ دالة واحدة فقط — بعد التعديلات الأمنية
userSchema.methods.generateAuthToken = async function () {
  const user = this;

  const accessToken = jwt.sign(
    { _id: user._id.toString() },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15min" }
  );

  const refreshToken = jwt.sign(
    { _id: user._id.toString() },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  user.tokens = user.tokens.concat({ accessToken });
  if (user.tokens.length > 10) {
    user.tokens = user.tokens.slice(-10);
  }
  await user.save();
  return { accessToken, refreshToken, user };
};

// ✅ يمنع إرسال password وtokens في أي response تلقائياً
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  delete user.key;
  return user;
};

export const User = new model("User", userSchema);