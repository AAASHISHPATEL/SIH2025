import { Router } from "express";
import * as userController from "../Controllers/userController.js";
import { body } from "express-validator"; 
import * as authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register",
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please enter a valid email address"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    userController.createUserController
);

router.post("/login", 
    body("email").isEmail().withMessage("Please enter a valid email address"),
    body("password").notEmpty().withMessage("Password is required"),
    userController.loginUserController
);

router.get("/profile",authMiddleware.authUser,
    userController.getUserProfileController
);

router.get("/logout",authMiddleware.authUser,
    userController.logoutUserController
);


export default router;