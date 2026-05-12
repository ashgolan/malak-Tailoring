import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) throw new Error("No token provided");
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.accessToken": token,
    });
    if (!user) throw new Error("User not found");
    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }
};
