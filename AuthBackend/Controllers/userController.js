import userModel from "../db/models/userModel.js";
import * as userService from "../Services/userService.js";
import {validationResult} from "express-validator";
import redisClient from "../Services/redisService.js";


export const createUserController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const user = await userService.createUser({ name, email, password });
    if (!user) {
      return res.status(400).send("User not created");
    }

    const token = user.generateJWT();

    // ✅ Set cookie (same as in login)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // ✅ Clean user object before sending
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({ user: userObj });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};


export const loginUserController=async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {email, password} = req.body;
    try {
        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).send("Invalid email or password");
        }
        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
            return res.status(401).send("Invalid email or password");
        }
        const token = await user.generateJWT();
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        return res.status(200).json({ user });

    } catch (error) {
        return res.status(500).send(error.message);
    }
}

export const getUserProfileController = async (req, res) => {
  if (!req.user) {
    return res.status(404).send("User not found");
  }

  res.set("Cache-Control", "no-store");
  return res.status(200).json({ user: req.user });
};





export const logoutUserController = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).send("No token provided");
    }

    // Blacklist token in Redis for 24 hours
    await redisClient.set(token, "logout", "EX", 3600 * 24);

    // Clear cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    return res.status(500).send(error.message);
  }
};



