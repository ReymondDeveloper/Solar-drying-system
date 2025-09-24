import Address from "../models/addressModel.js";

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.findAll();
    res.json(addresses);
  } catch (err) {
    next(err);
  }
};
