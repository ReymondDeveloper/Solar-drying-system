import supabase from "../../database/supabase.db.js";
import { v4 as uuidv4 } from "uuid";

const Dryers = {
  findAll: async () => {
    const { data, error } = await supabase
      .from("dryers")
      .select(`
        id, dryer_name, location, available_capacity, maximum_capacity, rate, image_url, isverified,
        created_at, updated_at, created_by_id, updated_by_id
      `);
    if (error) throw error;
    return data;
  },

  findById: async (id) => {
    const { data, error } = await supabase
      .from("dryers")
      .select(`
        id, dryer_name, location, available_capacity, maximum_capacity, rate, image_url,isverified,
        created_at, updated_at, created_by_id, updated_by_id
      `)
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  create: async ({ dryer_name, location, available_capacity, maximum_capacity, rate, image_url = null, created_by_id = null, isverified = false }) => {
    const { data, error } = await supabase
      .from("dryers")
      .insert([
        {
          id: uuidv4(),
          dryer_name,
          location,
          available_capacity,
          maximum_capacity,
          rate,
          image_url,
          created_by_id,
          isverified
        },
      ])
      .select(`
        id, dryer_name, location, available_capacity, maximum_capacity, rate, image_url,
        created_at, created_by_id, isverified
      `)
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id, { dryer_name, location, available_capacity, maximum_capacity, rate, image_url, updated_by_id, isverified }) => {
    const { data, error } = await supabase
      .from("dryers")
      .update({
        dryer_name,
        location,
        available_capacity,
        maximum_capacity,
        rate,
        image_url,
        updated_by_id,
        isverified,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        id, dryer_name, location, available_capacity, maximum_capacity, rate, image_url,
        updated_at, updated_by_id, isverified
      `)
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from("dryers")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

export default Dryers;
