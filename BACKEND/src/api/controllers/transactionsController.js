import Transactions from "../models/Transactions.js";

export const uploadTransaction = async (req, res) => {
  try {
    const { id: farmer_id } = req.user;
    const { amount, date, from, reference_no, reservation_id } = req.body;

    const transaction = await Transactions.create({
      farmer_id,
      amount,
      transaction_date: date,
      sender_number: from,
      reference_no,
      reservation_id,
    });

    res.status(201).json({
      message: "Transaction uploaded successfully",
      transaction,
    });
  } catch (err) {
    res.status(400).json({
      message: "Failed to upload transaction",
      error: err.message,
    });
  }
};

export const getFarmerTransactions = async (req, res) => {
  try {
    const { reservation_id } = req.params;
    const transactions = await Transactions.findByFarmer(reservation_id);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching transactions",
      error: err.message,
    });
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transactions.findAll();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching all transactions",
      error: err.message,
    });
  }
};
