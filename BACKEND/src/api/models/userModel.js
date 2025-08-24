import supabase from "../../database/supabase.db.js";
import { v4 as uuidv4 } from "uuid";

const User = {
  // Get all users
  findAll: async () => {
    const { data, error } = await supabase.from("users") // your table name in Supabase
      .select(`
        id, created_at, first_name, middle_name, last_name, email,
        is_admin, is_farmer, is_owner, created_by_id, deleted_at, deleted_by_id, user_profile
      `);
    if (error) throw error;
    return data;
  },

  // Find user by ID
  findById: async (id) => {
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id, created_at, first_name, middle_name, last_name, email,
        is_admin, is_farmer, is_owner, created_by_id, deleted_at, deleted_by_id, user_profile
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

  // Create new user
  create: async ({
    first_name,
    middle_name,
    last_name,
    email,
    password,
    is_admin = false,
    is_farmer = false,
    is_owner = false,
    created_by_id = null,
    user_profile = null,
  }) => {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          id: uuidv4(),
          first_name,
          middle_name,
          last_name,
          email,
          password,
          is_admin,
          is_farmer,
          is_owner,
          created_by_id,
          user_profile,
        },
      ])
      .select(
        `
        id, first_name, middle_name, last_name, email,
        is_admin, is_farmer, is_owner, created_by_id, user_profile
      `
      )
      .single();
    if (error) throw error;
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
