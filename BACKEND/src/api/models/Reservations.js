import supabase from "../../database/supabase.db.js";
import { v4 as uuidv4 } from "uuid";

const Reservations = {
  findAll: async ({ farmer_id } = {}) => {
    let query = supabase
      .from("reservations")
      .select(
        `
      id,
      farmer_id:farmer_id (id, first_name, last_name, email, mobile_number),
      owner_id:owner_id (id, first_name, last_name, email, mobile_number),
      dryer_id:dryer_id (id, dryer_name, location, rate, available_capacity),
      crop_type_id:crop_type_id (crop_type_id, crop_type_name, quantity, payment, notes),
      status,
      created_at
    `
      )
      .order("created_at", { ascending: false });

    if (farmer_id) query = query.eq("farmer_id", farmer_id);
    const { data, error } = await query;
    if (error) throw error;

    return data;
  },

  findById: async (id) => {
    const { data, error } = await supabase
      .from("reservations")
      .select(
        `
        id,
        farmer_id:farmer_id (
          id, first_name, last_name, email, mobile_number
        ),
        dryer_id:dryer_id ( 
          id, dryer_name, location, rate, available_capacity
        ),
        crop_type_id:crop_type_id ( 
          crop_type_id, crop_type_name, quantity, payment, notes
        ),
        status,
        created_at
      `
      )
      .eq("farmer_id.id", id)
      .single();

    if (error) throw error;
    return data;
  },

  create: async ({ farmer_id, dryer_id, crop_type_id }) => {
    const { data, error } = await supabase
      .from("reservations")
      .insert([
        {
          id: uuidv4(),
          farmer_id,
          dryer_id,
          crop_type_id,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id, { status }) => {
    const { data, error } = await supabase
      .from("reservations")
      .update({
        status,
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

  checkReservation: async (farmer_id, dryer_id) => {
    const { data, error } = await supabase
      .from("reservations")
      .select("id")
      .eq("farmer_id", farmer_id)
      .eq("dryer_id", dryer_id)
      .single();

    if (error && error.code !== "PGRST116") throw error; // ignore not found
    return !!data;
  },
};

export default Reservations;
