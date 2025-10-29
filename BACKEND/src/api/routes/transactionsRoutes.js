import express from "express";
import {
  uploadTransaction,
  getFarmerTransactions,
  getAllTransactions,
} from "../controllers/transactionsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, uploadTransaction);
router.get("/:reservation_id", protect, getFarmerTransactions);
router.get("/all", protect, getAllTransactions);

export default router;
