import Ratings from "../models/Ratings.js";

export const postRatings = async (req, res) => {
  try {
    const { dryer_id, rating, comment, farmer_id } = req.body;
    
    await Ratings.create(
      dryer_id,
      rating,
      comment,
      farmer_id,
    );

    res.status(201).json({
      message: "Rating submitted successfully",
    });
  } catch (err) {
    res.status(400).json({
      message: "Failed to submitted rating",
      error: err.message,
    });
  }
};

export const getRatings = async (req, res) => {
  try {
    const { dryer_id } = req.params;
    const transactions = await Ratings.findByDryer(dryer_id);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching ratings",
      error: err.message,
    });
  }
};