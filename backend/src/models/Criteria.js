const mongoose = require("mongoose");

const criteriaSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  attribute: {
    type: String,
    enum: ["benefit", "cost"],
    required: true,
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Criteria", criteriaSchema);
