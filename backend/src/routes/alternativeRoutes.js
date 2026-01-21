const express = require("express");
const router = express.Router();
const {
  getAlternatives,
  getAlternativeById,
  createAlternative,
  updateAlternative,
  deleteAlternative,
  getAlternativeSummary,
  importInitialAlternatives,
} = require("../controllers/alternativeController");

// GET /api/alternatives
router.get("/", getAlternatives);

// GET /api/alternatives/summary
router.get("/summary", getAlternativeSummary);

// GET /api/alternatives/:id
router.get("/:id", getAlternativeById);

// POST /api/alternatives
router.post("/", createAlternative);

// PUT /api/alternatives/:id
router.put("/:id", updateAlternative);

// DELETE /api/alternatives/:id
router.delete("/:id", deleteAlternative);

// POST /api/alternatives/import-initial
router.post("/import-initial", importInitialAlternatives);

module.exports = router;
