import express from "express";
import { getChats, postChats } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getChats);
router.post("/", protect, postChats);

export default router;
