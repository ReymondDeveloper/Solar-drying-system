import express from "express";
import {
  getDryers,
  getDryerById,
  createDryer,
  updateDryer,
  deleteDryer,
  getOwned,
} from "../controllers/dryersController.js";

const router = express.Router();

router.get("/", getDryers);
router.get("/owned", getOwned);
router.get("/:id", getDryerById);
router.post("/", createDryer);
router.put("/:id", updateDryer);
router.delete("/:id", deleteDryer);

export default router;
