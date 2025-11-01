import supabase from "../../database/supabase.db.js";

const Chat = {
  findAll: async (reservation_id) => {
    if (!reservation_id) throw new Error("Missing reservation ID.");

    const { data, error } = await supabase
      .from("chats")
      .select(
        `
        created_at,
        message,
        created_at,
        sender
      `
      )
      .eq("reservation_id", reservation_id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return data;
  },

  create: async (message, sender, reservation_id) => {
    const { error } = await supabase
      .from("chats")
      .insert([
        {
          message,
          sender,
          reservation_id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
  },
};

export default Chat;
