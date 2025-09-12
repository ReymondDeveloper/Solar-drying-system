import Reservations from "../models/Reservations.js";
import CropTypes from "../models/cropTypes.js";

export const checkReservation = async (req, res) => {
    try {
        const { farmer_id, dryer_id } = req.query;
        const exists = await Reservations.checkReservation(farmer_id, dryer_id);
        res.json({ exists });
    } catch (err) {
        res.status(500).json({ message: "Error checking reservation", error: err.message });
    }
};


export const createReservation = async (req, res) => {
    try {
      const { farmer_id, dryer_id, owner_id, crop_type_name, quantity, payment } = req.body;
  
      if (!farmer_id || !dryer_id || !owner_id || !crop_type_name || !quantity) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      const exists = await Reservations.checkReservation(farmer_id, dryer_id);
      if (exists) {
        return res.status(400).json({ message: "You have already reserved this dryer." });
      }
  
      const cropType = await CropTypes.create({
        crop_type_name: crop_type_name.trim(),
        quantity,
        payment: payment || "gcash",
        created_by_id: farmer_id,
      });
  
      const reservation = await Reservations.create({
        farmer_id,
        dryer_id,
        owner_id,
        crop_type_id: cropType.crop_type_id,   
        quantity,
        payment: payment || "gcash",
      });
  
      res.status(201).json({ message: "Reservation created successfully", reservation });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create reservation", error: err.message });
    }
  };