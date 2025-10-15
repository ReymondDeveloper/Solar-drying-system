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

  create: async ({ crop_type_name, quantity, payment, created_by_id, notes }) => {
    const { data, error } = await supabase
      .from("crop_types")
      .insert([
        {
          crop_type_id: uuidv4(),
          crop_type_name,
          quantity,
          payment,
          created_by_id,
          notes: notes || null,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id, { crop_type_name, quantity, payment, updated_by_id, notes }) => {
    console.log("CropTypes.update called with:", { id, crop_type_name, quantity, payment, updated_by_id, notes });
    const { data, error } = await supabase
      .from("crop_types")
      .update({
        crop_type_name,
        quantity,
        payment,
        updated_by_id,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("crop_type_id", id)
      .select()
      .single();
      if (error) {
        console.error("Error updating crop type:", error);
        throw error;
      }
    
      console.log("CropTypes.update result:", data);
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