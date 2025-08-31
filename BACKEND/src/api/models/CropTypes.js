import supabase from "../../database/supabase.db.js";
import { v4 as uuidv4 } from "uuid";

const CropTypes = {
  findAll: async () => {
    const { data, error } = await supabase
      .from("crop_types")
      .select("*")
      .order("created_at", { ascending: false }); 
    if (error) throw error;
    return data;
  },

  findById: async (id) => {
    const { data, error } = await supabase
      .from("crop_types") 
      .select("*")
      .eq("crop_type_id", id)
      .single();
    if (error) throw error;
    return data;
  },

  create: async ({ crop_type_name, quantity, payment, created_by_id }) => {
    const { data, error } = await supabase
      .from("crop_types")
      .insert([
        {
          crop_type_id: uuidv4(),
          crop_type_name,
          quantity,
          payment,
          created_by_id,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id, { crop_type_name, quantity, payment, updated_by_id }) => {
    const { data, error } = await supabase
      .from("crop_types")
      .update({
        crop_type_name,
        quantity,
        payment,
        updated_by_id,
        updated_at: new Date().toISOString(),
      })
      .eq("crop_type_id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  delete: async (id, deleted_by_id) => {
    const { error } = await supabase
      .from("crop_types")
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by_id,
      })
      .eq("crop_type_id", id);
    if (error) throw error;
  },
};

export default CropTypes;