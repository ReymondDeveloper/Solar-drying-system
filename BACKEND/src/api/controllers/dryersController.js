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

    const { data, error } = await supabase
      .from("dryers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    const { data: owners, error: resError } = await supabase
      .from("users")
      .select("first_name, middle_name, last_name")
      .eq("id", data.created_by_id)
      .single();

    if (resError) throw resError;

    res.json({
      ...data,
      owner:
        owners.last_name + ", " + owners.first_name + " " + owners.middle_name,
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
