import express from "express";
import { getReservations, getReservationById, createReservation, updateReservation, deleteReservation, checkReservation, getReservationsByOwner } from "../controllers/ReservationsController.js";

const router = express.Router();

router.get("/", getReservations);
router.get("/:id", getReservationById);
router.post("/", createReservation);
router.put("/:id", updateReservation);
router.delete("/:id", deleteReservation);
router.get("/check", checkReservation);
router.get("/owner/:ownerId", getReservationsByOwner);

export default router;
