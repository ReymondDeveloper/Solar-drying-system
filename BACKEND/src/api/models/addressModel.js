import supabase from "../../database/supabase.db.js";

const Address = {
  findAll: async () => {
    const { data, error } = await supabase
      .from("addresses")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  },
};

export default Address;
