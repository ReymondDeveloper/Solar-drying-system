import express from "express";
import {
  getUsers,
  registerUser,
  deleteUser,
  loginUser,
  updatePassword,
  verifyOtp,
  verifyUser,
  updateProfile,
  findUser,
  updateUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../controllers/UploadController.js";

const router = express.Router();

// Public routes
router.post("/verify", verifyUser);
router.post("/register", registerUser);
router.put("/register", deleteUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.put("/update", updatePassword);
router.get("/activate", findUser);
router.put("/activate", updateUser);

// Protected routes
router.get("/", protect, getUsers);
router.put("/update-profile", protect, upload, updateProfile);

export default router;
