import supabase from "../../database/supabase.db.js";
import { v4 as uuidv4 } from "uuid";

const Reservations = {
  findAll: async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        id,
        created_at,
        status,
        notes,
        farmer:farmer_id (
          id, first_name, last_name, email, mobile_number
        ),
        dryer:dryer_id (
          id, dryer_name, location, capacity, rate
        ),
        owner:owner_id (
          id, first_name, last_name, email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  findById: async (id) => {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        id,
        created_at,
        status,
        notes,
        farmer:farmer_id (
          id, first_name, last_name, email, mobile_number
        ),
        dryer:dryer_id (
          id, dryer_name, location, capacity, rate
        ),
        owner:owner_id (
          id, first_name, last_name, email
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  create: async ({ farmer_id, dryer_id, owner_id, notes = null }) => {
    const { data, error } = await supabase
      .from("reservations")
      .insert([
        {
          id: uuidv4(),
          farmer_id,
          dryer_id,
          owner_id,
          notes,
        },
      ])
      .select(
        `id, created_at, status, notes, farmer_id, dryer_id, owner_id`
      )
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id, { status, notes }) => {
    const { data, error } = await supabase
      .from("reservations")
      .update({
        status,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase.from("reservations").delete().eq("id", id);
    if (error) throw error;
  },
};

export default Reservations;
