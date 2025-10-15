import supabase from "../../database/supabase.db.js";

const Notification = {
  findAll: async ({ user } = {}) => {
    let query = supabase
    .from("notifications")
    .select(
      `
        id,
        created_at,
        context,
        seen,
        url
      `
    )
    .order("created_at", { ascending: false });

    if (user) query = query.eq("user", user);
    const { data, error } = await query;
    if (error) throw error;

    return data;
  },

  create: async ({ context, url, user }) => {
    const { data, error } = await supabase
    .from("notifications")
    .insert([
      {
        context,
        url,
        user
      },
    ])
    .select()
    .single();

    if (error) throw error;
    return data;
  },

  update: async (id) => {
    const { data, error } = await supabase
    .from("notifications")
    .update({
      seen: true,
    })
    .eq("id", id)
    .select()
    .single();

    if (error) throw error;
    return data;
  },
};

export default Notification;
