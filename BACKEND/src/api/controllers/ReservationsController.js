import Reservations from "../models/Reservations.js";
import Dryers from "../models/dryersModel.js";  

export const getReservations = async (req, res) => {
  try {
    const { farmer_id } = req.query;

    let reservations = await Reservations.findAll();

    if (farmer_id) {
      reservations = reservations.filter(r => r.farmer?.id === farmer_id);
    }

    res.json(
      reservations.map(r => ({
        id: r.id,
        farmer_id: r.farmer?.id,
        farmer_name: r.farmer
          ? `${r.farmer.first_name} ${r.farmer.last_name}`
          : "N/A",
        dryer_id: r.dryer?.id,
        dryer_name: r.dryer?.dryer_name || "N/A",
        location: r.dryer?.location || "N/A",
        owner_id: r.owner?.id,
        owner_name: r.owner
          ? `${r.owner.first_name} ${r.owner.last_name}`
          : "N/A",
        status: r.status,
        notes: r.notes,
        created_at: r.created_at,
      }))
    );
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch reservations.", error: err.message });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservations.findByPk(id, {
      include: [
        {
          model: Dryers,
          attributes: ["dryer_name", "location"],
        },
      ],
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    res.json({
      id: reservation.id,
      farmer_id: reservation.farmer_id,
      dryer_id: reservation.dryer_id,
      owner_id: reservation.owner_id,
      status: reservation.status,
      notes: reservation.notes,
      created_at: reservation.created_at,
      dryer_name: reservation.dryer?.dryer_name || "N/A", 
      location: reservation.dryer?.location || "N/A",   
    });
  } catch (err) {
    res.status(404).json({ message: "Reservation not found.", error: err.message });
  }
};

export const createReservation = async (req, res) => {
  try {
    const { farmer_id, dryer_id, owner_id, crop_type, quantity, payment } = req.body;

    const notes = {
      crop_type,
      quantity,
      payment,
    };

    const reservation = await Reservations.create({
      farmer_id,
      dryer_id,
      owner_id,
      notes,  
    });

    res.status(201).json({ message: "Reservation created successfully.", reservation });
  } catch (err) {
    res.status(400).json({ message: "Failed to create reservation.", error: err.message });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const reservation = await Reservations.update(
      { status, notes },
      { where: { id }, returning: true }
    );

    res.json({ message: "Reservation updated successfully.", reservation });
  } catch (err) {
    res.status(400).json({ message: "Failed to update reservation.", error: err.message });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    await Reservations.destroy({ where: { id } });
    res.json({ message: "Reservation deleted successfully." });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete reservation.", error: err.message });
  }
};

export const checkReservation = async (req, res) => {
  try {
    const { farmer_id, dryer_id } = req.query;

    const reservation = await Reservations.findOne({
      where: { farmer_id, dryer_id },
    });

    res.json({ exists: !!reservation });
  } catch (err) {
    res.status(500).json({ message: "Error checking reservation", error: err.message });
  }
};

export const getReservationsByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const reservations = await Reservations.findAll();

    const filtered = reservations.filter(r => r.owner?.id === ownerId);

    res.json(
      filtered.map(r => ({
        id: r.id,
        farmer_id: r.farmer?.id,
        farmer_name: r.farmer
          ? `${r.farmer.first_name} ${r.farmer.last_name}`
          : "N/A",
        dryer_id: r.dryer?.id,
        dryer_location: r.dryer?.location || "N/A",
        crop_type: r.notes?.crop_type || "N/A",
        quantity: r.notes?.quantity || "N/A",
        status: r.status,
        created_at: r.created_at,
      }))
    );
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch reservations by owner.", error: err.message });
  }
};
