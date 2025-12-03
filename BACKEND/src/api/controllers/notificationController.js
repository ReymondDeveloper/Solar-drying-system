import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const user = req.user.id;
    const data = await Notification.findAll(user);

    if (data.length > 5) {
      const filtered = data.filter((notification) => !notification.seen);
      res.status(200).json(filtered);
    } else {
      res.status(200).json(data);
    }
  } catch (err) {
    console.log(err);
  }
};

export const putNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.update(id);
    res.status(200);
  } catch (err) {
    console.log(err);
  }
};

export const postNotifications = async (req, res) => {
  try {
    const { context, url, user } = req.body;
    await Notification.create(context, url, user);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
