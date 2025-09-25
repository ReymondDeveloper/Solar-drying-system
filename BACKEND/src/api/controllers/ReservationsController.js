import Reservations from "../models/Reservations.js";
import Dryers from "../models/dryersModel.js";  
import CropTypes from "../models/cropTypes.js";

export const getReservations = async (req, res) => {
  try {
    const { farmer_id, dryer_id } = req.query;

    let reservations = await Reservations.findAll({ farmer_id });

    if (dryer_id) reservations = reservations.filter(r => r.dryer?.id === dryer_id);

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reservations.", error: err.message });
  }
};
 
export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservations.findById(id);
    if (!reservation) return res.status(404).json({ message: "Reservation not found." });
    res.json(reservation);
  } catch (err) {
    res.status(404).json({ message: "Reservation not found.", error: err.message });
  }
};

export const createReservation = async (req, res) => {
  try {
    const { farmer_id, dryer_id, crop_type, quantity, payment } = req.body;

    if (!farmer_id || !dryer_id || !crop_type || !quantity || !payment) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const dryer = await Dryers.findById(dryer_id);

    if (dryer.available_capacity - quantity < 0) {
      return res.status(400).json({ message: "Available capacity is not enough." });
    }

    const cropType = await CropTypes.create({
      crop_type_name: crop_type.trim(),
      quantity,
      payment: payment,
      created_by_id: farmer_id,
    });

    const reservation = await Reservations.create({
      farmer_id,
      dryer_id,
      crop_type_id: cropType.crop_type_id,  
      status: "pending",
    });

    await Dryers.update(dryer_id, {
      available_capacity: dryer.available_capacity - quantity,
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
    const { status } = req.body;

    const reservation = await Reservations.update(id, { status });

    res.json({ message: "Reservation updated successfully.", reservation });
  } catch (err) {
    res.status(400).json({ message: "Failed to update reservation.", error: err.message });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    await Reservations.delete(id);
    res.json({ message: "Reservation deleted successfully." });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete reservation.", error: err.message });
  }
};

export const checkReservation = async (req, res) => {
  try {
    const { farmer_id, dryer_id } = req.query;
    const exists = await Reservations.checkReservation(farmer_id, dryer_id);
    res.json({ exists });
  } catch (err) {
    res.status(500).json({ message: "Error checking reservation", error: err.message });
  }
};

export const getReservationsByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const reservations = await Reservations.findAll();

    reservations = reservations.filter(r => r.owner?.id === ownerId);

    res.json(
      reservations.map(r => ({
        id: r.id,
        farmer_id: r.farmer?.id || null,
        farmer_name: r.farmer ? `${r.farmer.first_name} ${r.farmer.last_name}` : "N/A",
        dryer_id: r.dryer?.id || null,
        dryer_name: r.dryer?.dryer_name || "N/A",
        location: r.dryer?.location || "N/A",
        owner_id: r.owner?.id || null,
        owner_name: r.owner ? `${r.owner.first_name} ${r.owner.last_name}` : "N/A",
        status: r.status || "pending",
        created_at: r.created_at,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reservations by owner.", error: err.message });
  }
};
