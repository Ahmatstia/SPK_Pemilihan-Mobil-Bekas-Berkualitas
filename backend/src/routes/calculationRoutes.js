const express = require("express");
const router = express.Router();
const {
  calculateMOORAStepByStep,
  calculateCompleteMOORA,
  calculateAccuracy,
  getCalculationSummary,
} = require("../controllers/calculationController");

// POST /api/calculations/step-by-step
router.post("/step-by-step", calculateMOORAStepByStep);

// POST /api/calculations/complete
router.post("/complete", calculateCompleteMOORA);

// POST /api/calculations/accuracy
router.post("/accuracy", calculateAccuracy);

// GET /api/calculations/summary
router.get("/summary", getCalculationSummary);

module.exports = router;
