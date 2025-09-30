import express from "express";
import {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  checkReservation,
  getReservationsByOwner,
  getAllOwnersWithDryers,
} from "../controllers/ReservationsController.js";

const router = express.Router();

router.get("/", getReservations);
router.get("/check", checkReservation);
router.get("/owners", getAllOwnersWithDryers);
router.get("/owner", getReservationsByOwner);
router.post("/", createReservation);
router.put("/:id", updateReservation);
router.delete("/:id", deleteReservation);
router.get("/:id", getReservationById);

export default router;
