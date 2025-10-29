import supabase from "../../database/supabase.db.js";
import { v4 as uuidv4 } from "uuid";

const Transactions = {
  create: async ({
    farmer_id,
    amount,
    transaction_date,
    sender_number,
    reference_no,
    reservation_id,
  }) => {
    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          id: uuidv4(),
          farmer_id,
          amount,
          transaction_date,
          sender_number,
          reference_no,
          reservation_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  findByFarmer: async (reservation_id) => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("reservation_id", reservation_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  findAll: async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
};

export default Transactions;
