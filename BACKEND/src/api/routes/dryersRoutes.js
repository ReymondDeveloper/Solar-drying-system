import express from "express";
import { getDryers, getDryerById, createDryer, updateDryer, deleteDryer } from "../controllers/dryersController.js";

const router = express.Router();

router.get("/", getDryers);
router.get("/:id", getDryerById);
router.post("/", createDryer);
router.put("/:id", updateDryer);
router.delete("/:id", deleteDryer);

export default router;
