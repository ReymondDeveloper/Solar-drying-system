import supabase from "../../database/supabase.db.js";

export const payment_validation = async () => {
    let query = supabase
        .from("reservations")
        .select(
            `
                id,
                crop_type_id:crop_type_id(crop_type_id),
                updated_at,
                status
            `
        )
        .not("updated_at", "is", null);

    const { data, error } = await query;
    if (error) throw error;
    
    await Promise.all(
        data.map(async (reservation) => {
            if (new Date(reservation.updated_at.replace('T', ' ').replace('+00:00', '')) < new Date().setDate(new Date().getDate() - 1)) {
                const { count: history_count, error: history_error } = await supabase
                .from("crop_history")
                .select(
                    `
                        id,
                        crop_types
                    `, { count: "exact" }
                )
                .eq("crop_types", reservation.crop_type_id.crop_type_id);

                if (history_error) throw history_error;

                const { count: transactions_count, error: transactions_error } = await supabase
                    .from("transactions")
                    .select(
                        `
                            id
                        `, { count: "exact" }
                    )
                    .eq("reservation_id", reservation.id);

                if (transactions_error) throw transactions_error;


                if (history_count >= transactions_count) {
                    const { data, error } = await supabase
                        .from("reservations")
                        .update({
                            status: "canceled",
                            canceled_reason: "System detected a 24 hours no payment."
                        })
                        .eq("id", reservation.id)
                        .select();
                    if (error) throw error;

                    console.log(data);
                }

                console.log("history_count: ", history_count)
                console.log("transactions_count: ", transactions_count)
                console.log("condition: ", history_count >= transactions_count)
            }
        })
    )
};