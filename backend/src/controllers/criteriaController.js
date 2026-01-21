const Criteria = require("../models/Criteria");

// @desc    Get all criteria
// @route   GET /api/criteria
// @access  Public
const getCriteria = async (req, res) => {
  try {
    const criteria = await Criteria.find().sort("code");
    res.json(criteria);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single criteria
// @route   GET /api/criteria/:id
// @access  Public
const getCriteriaById = async (req, res) => {
  try {
    const criteria = await Criteria.findById(req.params.id);
    if (!criteria) {
      return res.status(404).json({ message: "Criteria not found" });
    }
    res.json(criteria);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create criteria
// @route   POST /api/criteria
// @access  Public
const createCriteria = async (req, res) => {
  try {
    const { code, name, attribute, weight, description } = req.body;

    // Validasi
    if (!code || !name || !attribute || !weight) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    // Cek apakah code sudah ada
    const existingCriteria = await Criteria.findOne({ code });
    if (existingCriteria) {
      return res.status(400).json({ message: "Criteria code already exists" });
    }

    const criteria = new Criteria({
      code,
      name,
      attribute,
      weight: parseFloat(weight),
      description,
    });

    const createdCriteria = await criteria.save();
    res.status(201).json(createdCriteria);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update criteria
// @route   PUT /api/criteria/:id
// @access  Public
const updateCriteria = async (req, res) => {
  try {
    const { code, name, attribute, weight, description } = req.body;

    const criteria = await Criteria.findById(req.params.id);
    if (!criteria) {
      return res.status(404).json({ message: "Criteria not found" });
    }

    // Cek jika code diubah dan sudah ada
    if (code && code !== criteria.code) {
      const existingCriteria = await Criteria.findOne({ code });
      if (existingCriteria) {
        return res
          .status(400)
          .json({ message: "Criteria code already exists" });
      }
    }

    criteria.code = code || criteria.code;
    criteria.name = name || criteria.name;
    criteria.attribute = attribute || criteria.attribute;
    criteria.weight = weight ? parseFloat(weight) : criteria.weight;
    criteria.description =
      description !== undefined ? description : criteria.description;

    const updatedCriteria = await criteria.save();
    res.json(updatedCriteria);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete criteria
// @route   DELETE /api/criteria/:id
// @access  Public
const deleteCriteria = async (req, res) => {
  try {
    const criteria = await Criteria.findById(req.params.id);
    if (!criteria) {
      return res.status(404).json({ message: "Criteria not found" });
    }

    await criteria.deleteOne();
    res.json({ message: "Criteria removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get criteria summary (for dashboard)
// @route   GET /api/criteria/summary
// @access  Public
const getCriteriaSummary = async (req, res) => {
  try {
    const criteria = await Criteria.find().sort("code");

    const summary = {
      total: criteria.length,
      benefitCount: criteria.filter((c) => c.attribute === "benefit").length,
      costCount: criteria.filter((c) => c.attribute === "cost").length,
      totalWeight: criteria.reduce((sum, c) => sum + c.weight, 0),
      criteria: criteria.map((c) => ({
        code: c.code,
        name: c.name,
        attribute: c.attribute,
        weight: c.weight,
        weightPercentage: ((c.weight / 100) * 100).toFixed(2) + "%",
      })),
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Import initial criteria data
// @route   POST /api/criteria/import-initial
// @access  Public
const importInitialCriteria = async (req, res) => {
  try {
    const { initialCriteria } = require("../data/initialData");

    // Hapus data lama
    await Criteria.deleteMany({});

    // Import data baru
    const importedCriteria = await Criteria.insertMany(initialCriteria);

    res.json({
      message: "Initial criteria imported successfully",
      count: importedCriteria.length,
      criteria: importedCriteria,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCriteria,
  getCriteriaById,
  createCriteria,
  updateCriteria,
  deleteCriteria,
  getCriteriaSummary,
  importInitialCriteria,
};
