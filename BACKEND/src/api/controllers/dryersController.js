import supabase from "../../database/supabase.db.js";

export const getDryers = async (req, res) => {
  try {
    const { data, error } = await supabase.from("dryers").select("*");

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dryers.", error: err.message });
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
