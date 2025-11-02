import Chat from "../models/Chat.js";

export const getChats = async (req, res) => {
  try {
    const reservation = req.query.id;
    const data = await Chat.findAll(reservation);
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
  }
};

export const postChats = async (req, res) => {
  try {
    let { message, sender, reservation_id } = req.body;
    await Chat.create(message, sender, reservation_id);
    res.status(200);
  } catch (err) {
    console.log(err);
  }
};
