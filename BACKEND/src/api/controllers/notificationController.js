import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const user = req.user.id;
    const data = await Notification.findAll(user);
    res.status(200).json(data);
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
    let { context, url, user } = req.body;
    url ? url : (url = null);
    await Notification.create(context, url, user);
    res.status(200);
  } catch (err) {
    console.log(err);
  }
};
