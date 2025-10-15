import supabase from "../../database/supabase.db.js";

const Notification = {
  findAll: async (user) => {
    if (!user) throw new Error("Missing user ID.");

    const { data, error } = await supabase
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
      .eq("user", user)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  },

  create: async (context, url, user) => {
    const { error } = await supabase.from("notifications").insert([
      {
        context,
        url,
        user,
      },
    ]);

    if (error) throw error;
  },

  update: async (id) => {
    const { data, error } = await supabase
      .from("notifications")
      .update({
        seen: true,
      })
      .eq("id", id);

    if (error) throw error;
  },
};

export default Notification;
