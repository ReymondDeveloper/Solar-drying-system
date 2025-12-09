import supabase from "../../database/supabase.db.js";
import { v4 as uuidv4 } from "uuid";

const User = {
  // Get all users
  findAll: async () => {
    const { data, error } = await supabase
      .from("users") // your table name in Supabase
      .select(
        `id, name, address, role`
      );
    if (error) throw error;
    return data;
  },

  // Find user by ID
  findById: async (id) => {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id, created_at, name, role, created_by_id, deleted_at, deleted_by_id
      `
      )
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  // Find user by email
  findByEmail: async (email) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    if (error && error.code !== "PGRST116") throw error; // ignore not found
    return data;
  },

  // Update password
  updatePassword: async (email, hashedPassword) => {
    const { error } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("email", email);
    if (error) throw error;
  },
};

export default User;
