const mongoose = require("mongoose");

const rankingSchema = new mongoose.Schema({
  alternativeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alternative",
    required: true,
  },
  preferenceScore: {
    type: Number,
    required: true,
  },
  rank: {
    type: Number,
    required: true,
  },
  normalizedValues: {
    type: Map,
    of: Number,
  },
  weightedValues: {
    type: Map,
    of: Number,
  },
  calculationDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Ranking", rankingSchema);
