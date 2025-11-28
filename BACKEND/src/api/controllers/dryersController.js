import supabase from "../../database/supabase.db.js";

export const getOwned = async (req, res) => {
  console.log("Getting Owned Dryers: BEGIN:", req.query);
  const { id, limit, offset, location, search } = req.query;
  try {
    let query = supabase
      .from("dryers")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (typeof limit !== "undefined" && typeof offset !== "undefined") {
      const start = Number(offset);
      const end = start + Number(limit) - 1;
      query = query.range(start, end);
    }

    if (location !== undefined && location !== "all") {
      query = query.eq("location", location);
    }

    if (search !== undefined && search) {
      query = query.ilike("dryer_name", `%${search}%`);
    }

    query = query.eq("created_by_id", id);

    const { data, count, error } = await query;

    if (error && error.code !== "PGRST116") throw error;

    res.json({ data, totalCount: count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong..." });
  } finally {
    console.log("Getting Owned Dryers: END");
  }
};

export const getDryers = async (req, res) => {
  const { limit, offset, role, status, location, search, is_operation } =
    req.query;
  try {
    let query = supabase
      .from("dryers")
      .select(
        "id, dryer_name, location, available_capacity, maximum_capacity, rate, image_url, created_by_id, created_at, is_operation, operation_reason",
        { count: "exact" },
      )
      .order("created_at", { ascending: false });

    if (typeof limit !== "undefined" && typeof offset !== "undefined") {
      const start = Number(offset);
      const end = start + Number(limit) - 1;
      query = query.range(start, end);
    }

    if (typeof location !== "undefined" && location && location !== "all") {
      query = query.eq("location", location);
    }

    if (typeof status !== "undefined" && status && status !== "all") {
      if (status === "available") {
        query = query.gt("available_capacity", 0);
      } else if (status === "occupied") {
        query = query.eq("available_capacity", 0);
      }
    }

    if (typeof search !== "undefined" && search) {
      query = query.ilike("dryer_name", `%${search}%`);
    }

    if (typeof role !== "undefined" && role) {
      if (role === "farmer") {
        query = query.eq("is_operation", true);
      }
    }

    if (typeof is_operation !== "undefined" && is_operation !== "all") {
      query = query.eq("is_operation", is_operation === "yes" ? true : false);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    res.json({ data, totalCount: count });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching dryers", error: err.message });
  }
};

export const getDryerById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: dryer, error: dryerError } = await supabase
      .from("dryers")
      .select("*")
      .eq("id", id)
      .single();
    if (dryerError) throw dryerError;

    const { data: owner, error: ownerError } = await supabase
      .from("users")
      .select("first_name, middle_name, last_name")
      .eq("id", dryer.created_by_id)
      .single();
    if (ownerError) throw ownerError;

    const { data: reservations, error: reservationsError } = await supabase
      .from("reservations")
      .select(
        "id, farmer_id, status, created_at, crop_type_id, crop_types(crop_type_name, quantity), date_from, date_to",
      )
      .eq("dryer_id", id);
    if (reservationsError) throw reservationsError;

    const farmers = await Promise.all(
      reservations.map(async (reservation) => {
        const { data: farmer, error: farmerError } = await supabase
          .from("users")
          .select("first_name, last_name, id")
          .eq("id", reservation.farmer_id)
          .single();
        if (farmerError) return null;

        return {
          farmer_id: farmer.id,
          farmer_name: `${farmer.first_name} ${farmer.last_name}`,
          crop_type: reservation.crop_types.crop_type_name,
          quantity: reservation.crop_types.quantity,
          status: reservation.status,
          reservation_date: reservation.created_at,
          date_from: reservation.date_from,
          date_to: reservation.date_to,
        };
      }),
    );

    const validFarmers = farmers.filter(Boolean);

    res.json({
      ...dryer,
      owner: `${owner.last_name}, ${owner.first_name} ${
        owner.middle_name || ""
      }`,
      farmers: validFarmers,
    });
  } catch (err) {
    res.status(404).json({ message: "Dryer not found.", error: err.message });
  }
};

export const createDryer = async (req, res) => {
  try {
    const {
      dryer_name,
      location,
      maximum_capacity,
      rate,
      image_url,
      created_by_id,
      qr_code,
      business_permit,
      is_operation = false,
      operation_reason = null,
    } = req.body;

    const { data, error } = await supabase
      .from("dryers")
      .insert([
        {
          dryer_name,
          location,
          maximum_capacity,
          available_capacity: maximum_capacity,
          rate,
          image_url,
          created_by_id,
          qr_code,
          is_operation,
          operation_reason,
          business_permit,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res
      .status(201)
      .json({ message: "Dryer created successfully.", dryer: data });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to create dryer.", error: err.message });
  }
};

export const updateDryer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      dryer_name,
      location,
      maximum_capacity,
      rate,
      image_url,
      qr_code,
      is_operation,
      operation_reason = null,
      business_permit,
    } = req.body;

    const { data: existingData, error: existingError } = await supabase
      .from("dryers")
      .select("available_capacity, maximum_capacity")
      .eq("id", id)
      .single();

    if (existingError) throw existingError;

    const existing_maximum_capacity = existingData.maximum_capacity || 0;
    const existing_available_capacity = existingData.available_capacity || 0;
    const available_capacity =
      existing_maximum_capacity < maximum_capacity
        ? Number(existing_available_capacity) +
          Number(maximum_capacity - existing_maximum_capacity)
        : existing_available_capacity;

    const { data, error } = await supabase
      .from("dryers")
      .update({
        dryer_name,
        location,
        maximum_capacity,
        rate,
        available_capacity,
        image_url,
        qr_code,
        is_operation,
        operation_reason,
        business_permit,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Dryer updated successfully.", dryer: data });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update dryer.", error: err.message });
  }
};

export const deleteDryer = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("dryers").delete().eq("id", id);

    if (error) throw error;

    res.json({ message: "Dryer deleted successfully." });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to delete dryer.", error: err.message });
  }
};
