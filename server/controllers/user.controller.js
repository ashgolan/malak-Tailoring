import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const userControllers = {
  createUser: async (req, res) => {
    try {
      if (!req.body.key || req.body.key !== process.env.REACT_APP_ADMIN)
        throw new Error("לא הוכנס מפתח הוספת או שינוי נתונים");
      if (req.body.role === "Admin") {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        const user = await User.create({ ...req.body, password: hash, key: "unknown" });
        if (!user) throw Error("שגיאה בהוספת הנתונים");
        res.status(200).send(user.toJSON()); // ✅ كان: res.status(200).send(user)
      } else {
        throw Error("שגיאה בהוספת הנתונים");
      }
    } catch (e) {
      res.status(400).send(e.message);
    }
  },

  getAllUsers: async (req, res) => {
    try {
      // ✅ كان: User.find() — يُعيد كل شيء بما فيه password وtokens
      const users = await User.find().select("-password -tokens -key");
      res.status(200).send(users);
    } catch (e) {
      res.status(400).send(e.message);
    }
  },

  updateUser: async (req, res) => {
    try {
      if (!req.body.key || req.body.key !== process.env.REACT_APP_ADMIN)
        throw Error("לא הוכנס מפתח הוספת או שינוי נתונים");
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.password, salt);
      const user = await User.findByIdAndUpdate(
        { _id: req.body._id },
        { $set: { ...req.body, password: hash } }
      );
      if (!user) throw Error("שגיאה בשליפת הנתונים");
      res.status(200).send(user);
    } catch (e) {
      res.status(400).send(e.message);
    }
  },

  deleteUser: async (req, res) => {
    try {
      if (!req.body.key || req.body.key !== process.env.REACT_APP_ADMIN)
        throw Error("לא הוכנס מפתח הוספת או שינוי נתונים");
      const user = await User.findByIdAndDelete({ _id: req.body._id });
      if (!user) throw Error("No data");
      res.status(200).send(user);
    } catch (e) {
      res.status(400).send(e.message);
    }
  },

  login: async (req, res) => {
    try {
      // ✅ جلب مباشر من MongoDB بدون toJSON
      const user = await User.collection.findOne({ email: req.body.email });
      if (!user) throw Error("user not found");
      if (user.isBlocked) throw Error("user is blocked");
      const isMatch = bcrypt.compareSync(req.body.password, user.password);
      if (!isMatch) throw Error("wrong password");
      // نحتاج mongoose instance لـ generateAuthToken
      const mongooseUser = await User.findById(user._id);
      const tokens = await mongooseUser.generateAuthToken();
      res.status(200).send(tokens);
    } catch (e) {
      res.status(400).send(e.message);
    }
  },

  logout: async (req, res) => {
    try {
      req.user.tokens = req.user.tokens.filter(
        (t) => t.accessToken !== req.token
      );
      await req.user.save();
      res.status(200).send({ message: "Logged out" });
    } catch (e) {
      res.status(400).send(e.message);
    }
  },

  getUser: async (req, res) => {
    res.status(200).send(req.user);
  },

  refreshToken: async (req, res) => {
    try {
      // ✅ يستخدم REFRESH_TOKEN_SECRET المنفصل
      const decoded = jwt.verify(
        req.body.refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      const user = await User.findById(decoded._id);
      if (!user) throw Error("User not found");
      if (user.isBlocked) throw Error("User is blocked");

      const tokens = await user.generateAuthToken();
      res.status(200).send(tokens);
    } catch (e) {
      res.status(401).send({ error: "Invalid refresh token" });
    }
  },
};
