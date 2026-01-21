const express = require("express");
const router = express.Router();
const Ranking = require("../models/Ranking");

// @desc    Get all rankings
// @route   GET /api/rankings
const getRankings = async (req, res) => {
  try {
    const rankings = await Ranking.find()
      .populate("alternativeId", "code name values")
      .sort("rank");

    res.json(rankings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top N rankings
// @route   GET /api/rankings/top/:n
const getTopRankings = async (req, res) => {
  try {
    const n = parseInt(req.params.n) || 5;
    const rankings = await Ranking.find()
      .populate("alternativeId", "code name values")
      .sort("rank")
      .limit(n);

    res.json(rankings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all rankings
// @route   DELETE /api/rankings
const clearRankings = async (req, res) => {
  try {
    await Ranking.deleteMany({});
    res.json({ message: "All rankings cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.get("/", getRankings);
router.get("/top/:n", getTopRankings);
router.delete("/", clearRankings);

module.exports = router;
