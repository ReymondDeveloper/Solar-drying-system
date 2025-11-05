import express from "express";
import {
  postRatings,
  getRatings,
} from "../controllers/ratingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, postRatings);
router.get("/:dryer_id", protect, getRatings);

export default router;
