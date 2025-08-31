import express from "express";
import { checkReservation, createReservation } from "../controllers/cropTypesController.js";

const router = express.Router();

router.get('/reservations/check', checkReservation);
router.post("/", createReservation);    

export default router;
