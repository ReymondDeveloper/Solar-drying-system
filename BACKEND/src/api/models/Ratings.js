import supabase from "../../database/supabase.db.js";

const Ratings = {
   create: async (dryer_id, rating, comment, farmer_id) => {
    const { error } = await supabase.from("ratings").insert([
      {
        dryer_id,
        rating,
        comment,
        farmer_id,
      },
    ]);

    if (error) throw error;
  },

  findByDryer: async (dryer_id) => {
    const { data, error } = await supabase
      .from("ratings")
      .select("*")
      .select(
        `
        farmer_id:farmer_id (
          first_name
        ),
        dryer_id,
        rating,
        comment,
        created_at
      `
      )
      .eq("dryer_id", dryer_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
};

export default Ratings;
