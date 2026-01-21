const Alternative = require("../models/Alternative");

// @desc    Get all alternatives
// @route   GET /api/alternatives
// @access  Public
const getAlternatives = async (req, res) => {
  try {
    const alternatives = await Alternative.find().sort("code");
    res.json(alternatives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single alternative
// @route   GET /api/alternatives/:id
// @access  Public
const getAlternativeById = async (req, res) => {
  try {
    const alternative = await Alternative.findById(req.params.id);
    if (!alternative) {
      return res.status(404).json({ message: "Alternative not found" });
    }
    res.json(alternative);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create alternative
// @route   POST /api/alternatives
// @access  Public
const createAlternative = async (req, res) => {
  try {
    const { code, name, values, description } = req.body;

    // Validasi
    if (!code || !name || !values) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    // Validasi values harus memiliki semua kriteria (K1-K7)
    const requiredKeys = ["K1", "K2", "K3", "K4", "K5", "K6", "K7"];
    const hasAllKeys = requiredKeys.every((key) => values.hasOwnProperty(key));

    if (!hasAllKeys) {
      return res.status(400).json({
        message: "Values must include K1, K2, K3, K4, K5, K6, K7",
      });
    }

    // Cek apakah code sudah ada
    const existingAlternative = await Alternative.findOne({ code });
    if (existingAlternative) {
      return res
        .status(400)
        .json({ message: "Alternative code already exists" });
    }

    // Konversi values ke number
    const processedValues = {};
    requiredKeys.forEach((key) => {
      processedValues[key] = parseFloat(values[key]) || 0;
    });

    const alternative = new Alternative({
      code,
      name,
      values: processedValues,
      description,
    });

    const createdAlternative = await alternative.save();
    res.status(201).json(createdAlternative);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update alternative
// @route   PUT /api/alternatives/:id
// @access  Public
const updateAlternative = async (req, res) => {
  try {
    const { code, name, values, description } = req.body;

    const alternative = await Alternative.findById(req.params.id);
    if (!alternative) {
      return res.status(404).json({ message: "Alternative not found" });
    }

    // Cek jika code diubah dan sudah ada
    if (code && code !== alternative.code) {
      const existingAlternative = await Alternative.findOne({ code });
      if (existingAlternative) {
        return res
          .status(400)
          .json({ message: "Alternative code already exists" });
      }
    }

    // Update values jika ada
    if (values) {
      const requiredKeys = ["K1", "K2", "K3", "K4", "K5", "K6", "K7"];
      const processedValues = { ...alternative.values };

      requiredKeys.forEach((key) => {
        if (values.hasOwnProperty(key)) {
          processedValues[key] = parseFloat(values[key]) || 0;
        }
      });

      alternative.values = processedValues;
    }

    alternative.code = code || alternative.code;
    alternative.name = name || alternative.name;
    alternative.description =
      description !== undefined ? description : alternative.description;

    const updatedAlternative = await alternative.save();
    res.json(updatedAlternative);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete alternative
// @route   DELETE /api/alternatives/:id
// @access  Public
const deleteAlternative = async (req, res) => {
  try {
    const alternative = await Alternative.findById(req.params.id);
    if (!alternative) {
      return res.status(404).json({ message: "Alternative not found" });
    }

    await alternative.deleteOne();
    res.json({ message: "Alternative removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get alternative summary (for dashboard)
// @route   GET /api/alternatives/summary
// @access  Public
const getAlternativeSummary = async (req, res) => {
  try {
    const alternatives = await Alternative.find().sort("code");

    const summary = {
      total: alternatives.length,
      alternatives: alternatives.map((a) => ({
        id: a._id,
        code: a.code,
        name: a.name,
        values: a.values,
        description: a.description,
      })),
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Import initial alternatives data
// @route   POST /api/alternatives/import-initial
// @access  Public
const importInitialAlternatives = async (req, res) => {
  try {
    const { initialAlternatives } = require("../data/initialData");

    // Hapus data lama
    await Alternative.deleteMany({});

    // Import data baru
    const importedAlternatives =
      await Alternative.insertMany(initialAlternatives);

    res.json({
      message: "Initial alternatives imported successfully",
      count: importedAlternatives.length,
      alternatives: importedAlternatives,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAlternatives,
  getAlternativeById,
  createAlternative,
  updateAlternative,
  deleteAlternative,
  getAlternativeSummary,
  importInitialAlternatives,
};
