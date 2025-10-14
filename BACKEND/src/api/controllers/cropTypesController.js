import Reservations from "../models/Reservations.js";
import CropTypes from "../models/CropTypes.js";

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
        notes: req.body.notes || null, 
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

  export const updateReservation = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
  
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
  
      console.log("Updating reservation ID:", id, "with status:", status, "and notes:", notes);
  
      const updatedReservation = await Reservations.update(id, { status });
  
      if (notes) {
        console.log("Updating crop type notes for crop_type_id:", updatedReservation.crop_type_id);
        const updatedCropType = await CropTypes.update(updatedReservation.crop_type_id, { notes });
        console.log("Updated crop type notes:", updatedCropType.notes);
      }
  
      res.status(200).json({ message: "Reservation updated successfully", reservation: updatedReservation });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update reservation", error: err.message });
    }
  };
  