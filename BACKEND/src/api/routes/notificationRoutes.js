import express from "express";
import {
  getNotifications,
  putNotifications,
  postNotifications,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/:id", protect, putNotifications);
router.post("/", postNotifications);

export default router;
