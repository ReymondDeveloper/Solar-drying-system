import supabase from "../../database/supabase.db.js";
import { v4 as uuidv4 } from "uuid";
import { subMonths } from "date-fns";
const Reservations = {
  findAll: async ({
    farmer_id,
    limit,
    offset,
    status,
    location,
    search,
  } = {}) => {
    const oneMonthAgo = subMonths(new Date(), 1).toISOString();
    let query = supabase
      .from("reservations")
      .select(
        `
        id,
        farmer_id:farmer_id (id, name, mobile_number),
        owner_id:owner_id (id, name, mobile_number),
        dryer_id:dryer_id (id, dryer_name, location, rate, available_capacity, qr_code, is_operation, operation_reason, business_type),
        crop_type_id:crop_type_id (crop_type_id, crop_type_name, quantity, payment, notes, created_at),
        status,
        created_at,
        date_from,
        date_to
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (typeof limit !== "undefined" && typeof offset !== "undefined") {
      const start = Number(offset);
      const end = start + Number(limit) - 1;
      query = query.range(start, end);
    }

    if (typeof location !== "undefined" && location && location !== "all") {
      query = query.eq("dryer_id.location", location);
    }

    if (typeof status !== "undefined" && status && status !== "all") {
      query = query.eq("status", status);
    }

    if (typeof search !== "undefined" && search) {
      query = query.ilike("dryer_id.dryer_name", `%${search}%`);
    }

    if (farmer_id) query = query.eq("farmer_id", farmer_id); // Filter by farmer_id
    query = query.gte("created_at", oneMonthAgo); // Filter to get only reservations from the last month

    const { data, count, error } = await query;
    if (error) throw error;

    return { data, totalCount: count };
  },

  findById: async (id) => {
    const { data, error } = await supabase
      .from("reservations")
      .select(
        `
        id,
        farmer_id:farmer_id (
          id, name, mobile_number
        ),
        dryer_id:dryer_id (
          id, dryer_name, location, rate, available_capacity,is_operation,operation_reason
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

  create: async ({
    farmer_id,
    dryer_id,
    crop_type_id,
    owner_id,
    date_from,
    date_to,
  }) => {
    const { data, error } = await supabase
      .from("reservations")
      .insert([
        {
          id: uuidv4(),
          farmer_id,
          dryer_id,
          crop_type_id,
          status: "pending",
          owner_id,
          date_from,
          date_to,
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
