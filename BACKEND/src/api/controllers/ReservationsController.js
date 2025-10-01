import Reservations from "../models/Reservations.js";
import Dryers from "../models/dryersModel.js";
import CropTypes from "../models/cropTypes.js";
import supabase from "../../database/supabase.db.js";

export const getReservations = async (req, res) => {
  try {
    const { dryer_id } = req.query;
    const { data: reservations, error: resError } = await supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });
    if (resError) throw resError;

    const formatted = await Promise.all(
      reservations.map(async (r) => {
        console.log("Processing reservation:", r);

        const { data: dryer, error: dryerError } = await supabase
          .from("dryers")
          .select("*")
          .eq("id", r.dryer_id)
          .single();

        if (dryerError) {
          console.error("Error fetching dryer:", dryerError);
          return null;
        }

        if (dryer_id && dryer.id !== dryer_id) return null;

        const { data: farmer, error: farmerError } = await supabase
          .from("users")
          .select("id, first_name, last_name")
          .eq("id", r.farmer_id)
          .single();

        if (farmerError) console.error("Error fetching farmer:", farmerError);

        const { data: cropType, error: cropTypeError } = await supabase
          .from("crop_types")
          .select("crop_type_name, quantity, payment")
          .eq("crop_type_id", r.crop_type_id)
          .single();

        if (cropTypeError)
          console.error("Error fetching crop type:", cropTypeError);

        const mapped = {
          id: r.id,
          farmer_id: farmer?.id || null,
          farmer_name: farmer
            ? `${farmer.first_name} ${farmer.last_name}`
            : "N/A",
          dryer_id: dryer?.id || null,
          dryer_name: dryer?.dryer_name || "N/A",
          dryer_location: dryer?.location || "N/A",
          crop_type: cropType?.crop_type_name || "N/A",
          quantity: r.quantity || cropType?.quantity || 0,
          payment: cropType?.payment || "N/A",
          rate: dryer?.rate || 0,
          status: r.status || "pending",
          created_at: r.created_at,
        };

        return mapped;
      })
    );

    const filtered = formatted.filter((f) => f !== null);

    res.json(filtered);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch reservations", error: err.message });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const { farmer_id } = req.query;  
    if (!farmer_id) return res.status(400).json({ message: "farmer_id is required" });

    const reservations = await Reservations.findAll({ farmer_id });  
    // if (!reservations || reservations.length === 0) {
    //   return res.status(404).json({ message: "No reservations found for this farmer." });
    // }

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Reservation fetch failed.", error: err.message });
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
      return res
        .status(400)
        .json({ message: "Available capacity is not enough." });
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

    res
      .status(201)
      .json({ message: "Reservation created successfully", reservation });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to create reservation", error: err.message });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0)
      return res
        .status(404)
        .json({ message: "Reservation not found or not updated" });

    res.json({
      message: "Reservation updated successfully.",
      reservation: data[0],
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update reservation.", error: err.message });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    await Reservations.delete(id);
    res.json({ message: "Reservation deleted successfully." });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to delete reservation.", error: err.message });
  }
};

export const checkReservation = async (req, res) => {
  try {
    const { farmer_id, dryer_id } = req.query;
    const exists = await Reservations.checkReservation(farmer_id, dryer_id);
    res.json({ exists });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error checking reservation", error: err.message });
  }
};

export const getReservationsByOwner = async (req, res) => {
  try {
    const { ownerId } = req.query;
    if (!ownerId) {
      return res.status(400).json({ message: "ownerId is required" });
    }

    const { data: reservations, error: resError } = await supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });

    if (resError) throw resError;

    const formatted = await Promise.all(
      reservations.map(async (r) => {
        const { data: dryer, error: dryerError } = await supabase
          .from("dryers")
          .select("*")
          .eq("id", r.dryer_id)
          .single();

        if (dryerError) {
          console.error("Error fetching dryer:", dryerError);
          return null;
        }

        if (dryer.created_by_id !== ownerId) return null;

        const { data: farmer, error: farmerError } = await supabase
          .from("users")
          .select("id, first_name, last_name")
          .eq("id", r.farmer_id)
          .single();

        if (farmerError) {
          console.error("Error fetching farmer:", farmerError);
        }

        const { data: cropType, error: cropTypeError } = await supabase
          .from("crop_types")
          .select("crop_type_name, quantity, payment")
          .eq("crop_type_id", r.crop_type_id)
          .single();

        if (cropTypeError) {
          console.error("Error fetching crop type:", cropTypeError);
        }

        return {
          id: r.id,
          farmer_id: farmer?.id || null,
          farmer_name: farmer
            ? `${farmer.first_name} ${farmer.last_name}`
            : "N/A",
          dryer_id: dryer?.id || null,
          dryer_name: dryer?.dryer_name || "N/A",
          dryer_location: dryer?.location || "N/A",
          crop_type: cropType?.crop_type_name || "N/A",
          quantity: r.quantity || cropType?.quantity || 0,
          payment: cropType?.payment || "N/A",
          rate: dryer?.rate || 0,
          status: r.status || "pending",
          created_at: r.created_at,
        };
      })
    );
    const filtered = formatted.filter((f) => f !== null);
    res.json(filtered);
  } catch (err) {
    console.error("Error in getReservationsByOwner:", err);
    res.status(500).json({
      message: "Failed to fetch reservations by owner.",
      error: err.message,
    });
  }
};

export const getAllOwnersWithDryers = async (req, res) => {
  try {
    const { data: dryers, error } = await supabase
      .from("dryers")
      .select("id, dryer_name, location, created_by_id, created_at");

    if (error) throw error;

    const ownerIds = [...new Set(dryers.map((d) => d.created_by_id))];
    const { data: owners, error: ownersError } = await supabase
      .from("users")
      .select("id, first_name, last_name, email")
      .in("id", ownerIds);

    console.log("Owners fetched:", owners);

    if (ownersError) throw ownersError;

    const result = owners.map((owner) => ({
      id: owner.id,
      name: `${owner.first_name} ${owner.last_name}`,
      email: owner.email,
      dryers: dryers
        .filter((d) => d.created_by_id === owner.id)
        .map((d) => ({
          id: d.id,
          name: d.dryer_name,
          location: d.location,
          created_at: d.created_at,
        })),
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch owners with dryers",
      error: err.message,
    });
  }
};
