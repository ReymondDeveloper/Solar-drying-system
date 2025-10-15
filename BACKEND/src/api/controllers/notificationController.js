import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const { user } = req.query;

    const data = await Notification.findAll(user);

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
  }
};
