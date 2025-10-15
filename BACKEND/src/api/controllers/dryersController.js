import supabase from "../../database/supabase.db.js";

export const getOwned = async (req, res) => {
  console.log("Getting Owned Dryers: BEGIN:", req.user);
  const { id } = req.user;
  try {
    const { data, error } = await supabase
      .from("dryers")
      .select("*")
      .eq("created_by_id", id)
      .order("created_at", { ascending: false });

    if (error && error.code !== "PGRST116") throw error;

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong..." });
  } finally {
    console.log("Getting Owned Dryers: END");
  }
};

export const getDryers = async (req, res) => {
  try {
    const { data: dryers, error } = await supabase
      .from("dryers")
      .select(
        "id, dryer_name, location, available_capacity, maximum_capacity, rate, image_url, created_by_id, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(dryers);
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
      .select(`
        id,
        farmer_id,
        status,
        created_at,
        crop_type_id,
        crop_types(crop_type_name, quantity)
      `)
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
        };
      })
    );

    const validFarmers = farmers.filter(Boolean);

    res.json({
      ...dryer,
      owner: `${owner.last_name}, ${owner.first_name} ${owner.middle_name || ""}`,
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
      available_capacity,
      image_url,
    } = req.body;
    const { data, error } = await supabase
      .from("dryers")
      .update({
        dryer_name,
        location,
        maximum_capacity,
        rate,
        available_capacity,
        image_url,
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
