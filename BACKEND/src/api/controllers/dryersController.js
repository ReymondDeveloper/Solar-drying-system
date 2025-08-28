import supabase from "../../database/supabase.db.js";

export const getDryers = async (req, res) => {
  try {
    const { offset = 0, limit = 10 } = req.query;

    const { data: dryers, error } = await supabase
      .from("dryers")
      .select("id, dryer_name, location, created_by_id")
      .order("created_at", { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    const dryersWithStatus = await Promise.all(
      dryers.map(async (dryer) => {
        const { data: reservations, error: resError } = await supabase
          .from("reservations")
          .select("id")
          .eq("dryer_id", dryer.id)
          .in("status", ["pending", "active"]);

        if (resError) throw resError;

        return {
          ...dryer,
          owner_id: dryer.created_by_id,
          status: reservations.length > 0 ? "occupied" : "available",
        };
      })
    );

    res.json(dryersWithStatus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching dryers", error: err.message });
  }
};


export const getDryerById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("dryers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(404).json({ message: "Dryer not found.", error: err.message });
  }
};

export const createDryer = async (req, res) => {
  try {
    const { dryer_name, location, capacity, rate, image_url, created_by_id } = req.body;

    const { data, error } = await supabase
      .from("dryers")
      .insert([
        {
          dryer_name,
          location,
          capacity,
          rate,
          image_url,
          created_by_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Dryer created successfully.", dryer: data });
  } catch (err) {
    res.status(400).json({ message: "Failed to create dryer.", error: err.message });
  }
};

export const updateDryer = async (req, res) => {
  try {
    const { id } = req.params;
    const { dryer_name, location, capacity, rate, image_url } = req.body;

    const { data, error } = await supabase
      .from("dryers")
      .update({
        dryer_name,
        location,
        capacity,
        rate,
        image_url,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Dryer updated successfully.", dryer: data });
  } catch (err) {
    res.status(400).json({ message: "Failed to update dryer.", error: err.message });
  }
};

export const deleteDryer = async (req, res) => {
  try {
    const { id } = req.params; 
    const { error } = await supabase.from("dryers").delete().eq("id", id);

    if (error) throw error;

    res.json({ message: "Dryer deleted successfully." });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete dryer.", error: err.message });
  }
};
