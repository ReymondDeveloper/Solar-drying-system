import express from "express";
import {
  getUsers,
  registerUser,
  loginUser,
  updatePassword,
  verifyOtp,
  verifyUser,
  updateProfile 
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../controllers/UploadController.js";

const router = express.Router();

// Public routes
router.post("/verify", verifyUser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);

// Protected routes
router.get("/", protect, getUsers);
router.put("/update", protect, updatePassword);
router.put("/update-profile", protect, upload, updateProfile);  

export default router;
