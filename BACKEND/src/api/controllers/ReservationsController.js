import Reservations from "../models/Reservations.js";
import Dryers from "../models/dryersModel.js";
import CropTypes from "../models/CropTypes.js";
import supabase from "../../database/supabase.db.js";
import { subMonths } from "date-fns";

export const getReservations = async (req, res) => {
  try {
    const { dryer_id, limit, offset } = req.query;
    let query = supabase
      .from("reservations")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (typeof limit !== "undefined" && typeof offset !== "undefined") {
      const start = Number(offset);
      const end = start + Number(limit) - 1;
      query = query.range(start, end);
    }

    const { data: reservations, count, error: resError } = await query;

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
          .select("crop_type_name, quantity, payment, notes")
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
          notes: cropType?.notes || r.notes || "",
          rate: dryer?.rate || 0,
          status: r.status || "pending",
          created_at: r.created_at,
          date_from: r.date_from,
          date_to: r.date_to,
        };

        return mapped;
      })
    );

    const filtered = formatted.filter((f) => f !== null);
    res.json({ data: filtered, totalCount: count });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch reservations", error: err.message });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const { farmer_id, limit, offset } = req.query;
    if (!farmer_id)
      return res.status(400).json({ message: "farmer_id is required" });

    const reservations = await Reservations.findAll({
      farmer_id,
      limit,
      offset,
    });

    res.json(reservations);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Reservation fetch failed.", error: err.message });
  }
};

export const getArchivedReservations = async (req, res) => {
  try {
    const oneMonthAgo = subMonths(new Date(), 1);
    const { limit, offset } = req.query;
    let query = supabase
      .from("reservations")
      .select(
        `
        id,
        farmer_id:farmer_id(id, first_name, last_name, email, mobile_number),
        dryer_id:dryer_id(id, dryer_name, location, rate, available_capacity, created_by_id),
        crop_type_id:crop_type_id(crop_type_name, quantity, payment, notes),
        status,
        created_at
      `,
        { count: "exact" }
      )
      .lt("created_at", oneMonthAgo.toISOString())
      .order("created_at", { ascending: false });

    if (typeof limit !== "undefined" && typeof offset !== "undefined") {
      const start = Number(offset);
      const end = start + Number(limit) - 1;
      query = query.range(start, end);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    const formattedData = data.map((r) => {
      return {
        id: r.id,
        farmer_id: r.farmer_id.id || null,
        farmer_name: `${r.farmer_id.first_name} ${r.farmer_id.last_name}`,
        dryer_id: r.dryer_id.id || null,
        dryer_name: r.dryer_id.dryer_name || "N/A",
        dryer_location: r.dryer_id.location || "N/A",
        crop_type: r.crop_type_id.crop_type_name || "N/A",
        quantity: r.crop_type_id.quantity || 0,
        payment: r.crop_type_id.payment || "N/A",
        notes: r.crop_type_id.notes || r.notes || "",
        rate: r.dryer_id.rate || 0,
        status: r.status || "pending",
        created_at: r.created_at,
      };
    });
    console.log("Archived reservations fetched:", formattedData);
    res.status(200).json({ data: formattedData, totalCount: count });
  } catch (error) {
    console.error("Error fetching archived reservations:", error);
    res.status(500).json({
      message: "Failed to fetch archived reservations",
      error: error.message,
    });
  }
};

export const createReservation = async (req, res) => {
  try {
    const {
      farmer_id,
      dryer_id,
      crop_type,
      quantity,
      payment,
      owner_id,
      date_from,
      date_to,
    } = req.body;

    if (
      !farmer_id ||
      !dryer_id ||
      !crop_type ||
      !quantity ||
      !payment ||
      !owner_id ||
      !date_from ||
      !date_to
    ) {
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
      owner_id,
      date_from,
      date_to,
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
    const { status, notes, payment, quantity } = req.body;

    const { data: updatedReservations, error: resError } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", id)
      .select();

    if (resError) throw resError;
    if (!updatedReservations || updatedReservations.length === 0) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const reservation = updatedReservations[0];

    const cropUpdate = {};
    if (notes !== undefined) cropUpdate.notes = notes;
    if (payment !== undefined) cropUpdate.payment = payment;
    if (quantity !== undefined) cropUpdate.quantity = quantity;

    if (Object.keys(cropUpdate).length > 0) {
      const { error: cropError } = await supabase
        .from("crop_types")
        .update(cropUpdate)
        .eq("crop_type_id", reservation.crop_type_id);

      if (cropError) throw cropError;
    }

    if (status.toLowerCase() === "denied" || status.toLowerCase() === "completed") {
      const { data: cropType, error: cropError } = await supabase
        .from("crop_types")
        .select("quantity")
        .eq("crop_type_id", reservation.crop_type_id)
        .single();
      if (cropError) throw cropError;

      const { data: dryer, error: dryerError } = await supabase
        .from("dryers")
        .select("available_capacity, maximum_capacity")
        .eq("id", reservation.dryer_id)
        .single();
      if (dryerError) throw dryerError;

      const newAvailable =
        Number(dryer.available_capacity) + Number(cropType.quantity);

      const safeAvailable =
        newAvailable > dryer.maximum_capacity
          ? dryer.maximum_capacity
          : newAvailable;

      const { error: updateDryerError } = await supabase
        .from("dryers")
        .update({ available_capacity: safeAvailable })
        .eq("id", reservation.dryer_id);

      if (updateDryerError) throw updateDryerError;

      console.log(
        `Rolled back ${cropType.quantity} cavans to dryer ${reservation.dryer_id}`
      );
    }

    res.json({
      message: "Reservation updated successfully.",
      reservation,
    });
  } catch (err) {
    console.error("Error updating reservation:", err);
    res.status(400).json({
      message: "Failed to update reservation.",
      error: err.message,
    });
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
    const { ownerId, limit, offset } = req.query;
    if (!ownerId) {
      return res.status(400).json({ message: "Missing ID." });
    }

    let query = supabase
      .from("reservations")
      .select(
        `
        id,
        farmer_id:farmer_id (id, first_name, last_name, email, mobile_number),
        owner_id:owner_id (id, first_name, last_name, email, mobile_number),
        dryer_id:dryer_id (id, dryer_name, location, rate, available_capacity),
        crop_type_id:crop_type_id (crop_type_id, crop_type_name, quantity, payment, notes, created_at),
        status,
        created_at,
        date_from,
        date_to
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (typeof limit !== "undefined" && typeof offset !== "undefined") {
      const start = Number(offset);
      const end = start + Number(limit) - 1;
      query = query.range(start, end);
    }

    const { data, count, error } = await query.eq("owner_id", ownerId);
    if (error) throw error;
    res.json({ data, totalCount: count });
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
