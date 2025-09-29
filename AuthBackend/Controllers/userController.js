import userModel from "../db/models/userModel.js";
import * as userService from "../Services/userService.js";
import {validationResult} from "express-validator";
import redisClient from "../Services/redisService.js";


export const createUserController=async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const {name,email, password} = req.body;
   
    try {
        const user= await userService.createUser({name,email, password});
        if(!user) {
            return res.status(400).send("User not created");
        }

        const token = await user.generateJWT();
        delete user._doc.password; // Remove password from response
        return res.status(201).json({user, token});
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

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
        return res.status(200).json({ user, token });
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

export const getUserProfileController=async (req, res) => {
   
    try {
        const user = req.user; // Assuming user is attached to req by auth middleware
        if (!user) {
            return res.status(404).send("User not found");
        }
        return res.status(200).json({user: req.user});
    } catch (error) {
        return res.status(500).send(error.message);
    }
}

export const logoutUserController=async (req, res) => {
    try {
        const token =req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).send("No token provided");
        }
        redisClient.set(token, 'logout', 'EX', 3600*24); // Store token in Redis with 24 hour expiration
    res.status(200).json({message: "User logged out successfully"});

    } catch (error) {
        return res.status(500).send(error.message);
    }
}


