const express = require("express");
const router = express.Router();
const {
  getCriteria,
  getCriteriaById,
  createCriteria,
  updateCriteria,
  deleteCriteria,
  getCriteriaSummary,
  importInitialCriteria,
} = require("../controllers/criteriaController");

// GET /api/criteria
router.get("/", getCriteria);

// GET /api/criteria/summary
router.get("/summary", getCriteriaSummary);

// GET /api/criteria/:id
router.get("/:id", getCriteriaById);

// POST /api/criteria
router.post("/", createCriteria);

// PUT /api/criteria/:id
router.put("/:id", updateCriteria);

// DELETE /api/criteria/:id
router.delete("/:id", deleteCriteria);

// POST /api/criteria/import-initial
router.post("/import-initial", importInitialCriteria);

module.exports = router;
