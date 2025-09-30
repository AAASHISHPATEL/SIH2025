import jwt from "jsonwebtoken";
import redisClient from "../Services/redisService.js";
import userModel from "../db/models/userModel.js";

export const authUser = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ error: "Unauthorized User" });
    }

    const isBlacklisted = await redisClient.get(token);
    if (isBlacklisted) {
      return res.status(401).send({ error: "Unauthorized User" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Fetch by _id
    const user = await userModel.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).send({ error: "Unauthorized User" });
  }
};
