import express from "express";
import { getAddresses } from "../controllers/addressController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAddresses);

export default router;
