import express from "express";
import { getUsers, registerUser, loginUser, updatePassword, verifyOtp } from "../controllers/userController.js";
// import { protect } from "../middleware/authMiddleware.js"; // I comment auth Middleware for the min time

const router = express.Router();

// router.get("/", protect, getUsers);   // protected route
router.get("/", getUsers);            
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);

// router.put("/update-password", protect, updatePassword); // protected route
router.put("/update/:id", updatePassword);     

export default router;
