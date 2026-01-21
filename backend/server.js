// MOORA DSS Backend Server - Complete Version
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/moora_dss", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schema Definitions
const CriteriaSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  attribute: { type: String, enum: ["benefit", "cost"], required: true },
  weight: { type: Number, required: true },
  description: String,
});

const AlternativeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  values: {
    K1: { type: Number, required: true },
    K2: { type: Number, required: true },
    K3: { type: Number, required: true },
    K4: { type: Number, required: true },
    K5: { type: Number, required: true },
    K6: { type: Number, required: true },
    K7: { type: Number, required: true },
  },
  description: String,
});

const RankingSchema = new mongoose.Schema({
  alternativeId: { type: mongoose.Schema.Types.ObjectId, ref: "Alternative" },
  preferenceScore: { type: Number, required: true },
  rank: { type: Number, required: true },
  normalizedValues: { type: Map, of: Number },
  weightedValues: { type: Map, of: Number },
  calculationDate: { type: Date, default: Date.now },
});

const Criteria = mongoose.model("Criteria", CriteriaSchema);
const Alternative = mongoose.model("Alternative", AlternativeSchema);
const Ranking = mongoose.model("Ranking", RankingSchema);

// Data dari jurnal (17 mobil lengkap)
const initialCriteria = [
  {
    code: "K1",
    name: "Harga",
    attribute: "cost",
    weight: 21.06,
    description: "Harga mobil bekas dalam juta rupiah",
  },
  {
    code: "K2",
    name: "Tahun Produksi",
    attribute: "benefit",
    weight: 19.52,
    description: "Tahun produksi mobil (semakin baru semakin baik)",
  },
  {
    code: "K3",
    name: "Kapasitas Mesin",
    attribute: "benefit",
    weight: 7.99,
    description: "Kapasitas mesin dalam cc",
  },
  {
    code: "K4",
    name: "Kapasitas Penumpang",
    attribute: "benefit",
    weight: 13.33,
    description: "Jumlah penumpang yang dapat diangkut",
  },
  {
    code: "K5",
    name: "Pemeliharaan",
    attribute: "benefit",
    weight: 16.79,
    description: "Kemudahan dan biaya pemeliharaan",
  },
  {
    code: "K6",
    name: "Suku Cadang",
    attribute: "benefit",
    weight: 15.64,
    description: "Ketersediaan dan harga suku cadang",
  },
  {
    code: "K7",
    name: "Layanan Aftersales",
    attribute: "benefit",
    weight: 5.67,
    description: "Kualitas layanan purna jual",
  },
];

const initialAlternatives = [
  {
    code: "Mbl01",
    name: "BMW 320i 2.0 F30 Sport Bensin-AT",
    values: { K1: 329, K2: 13, K3: 1997, K4: 5, K5: 5, K6: 11, K7: 11 },
  },
  {
    code: "Mbl02",
    name: "Daihatsu Terios 1.5 TX Adventure Bensin-MT",
    values: { K1: 150, K2: 13, K3: 1495, K4: 7, K5: 8.5, K6: 12, K7: 8.5 },
  },
  {
    code: "Mbl03",
    name: "Daihatsu Xenia 1.3 R Sporty Bensin-MT",
    values: { K1: 183, K2: 19, K3: 1500, K4: 7, K5: 7.5, K6: 12.5, K7: 7 },
  },
  {
    code: "Mbl04",
    name: "Ford Fiesta 1.0 EcoBoost S Bensin-AT",
    values: { K1: 139, K2: 14, K3: 1500, K4: 5, K5: 6.5, K6: 11, K7: 5.5 },
  },
  {
    code: "Mbl05",
    name: "Honda CRV 1.5 Turbo Bensin-AT",
    values: { K1: 405, K2: 19, K3: 2354, K4: 5, K5: 8.5, K6: 11, K7: 11.5 },
  },
  {
    code: "Mbl06",
    name: "Honda HRV 1.8 Prestige Bensin-AT",
    values: { K1: 255, K2: 18, K3: 1500, K4: 5, K5: 7.5, K6: 12, K7: 13 },
  },
  {
    code: "Mbl07",
    name: "Honda Jazz GK-AT",
    values: { K1: 205, K2: 15, K3: 1500, K4: 5, K5: 7.5, K6: 12, K7: 10 },
  },
  {
    code: "Mbl08",
    name: "Mitsubishi Pajero Sport 2.4 Dakar 4x2 Solar-AT",
    values: { K1: 475, K2: 19, K3: 2442, K4: 7, K5: 7.5, K6: 11, K7: 11.5 },
  },
  {
    code: "Mbl09",
    name: "Mitsubishi Xpander 1.5 Cross Premium Package Bensin-AT",
    values: { K1: 265, K2: 21, K3: 1499, K4: 7, K5: 7.5, K6: 12, K7: 13 },
  },
  {
    code: "Mbl10",
    name: "Suzuki APV 1.5 Luxury Bensin-MT",
    values: { K1: 110, K2: 12, K3: 1490, K4: 9, K5: 8.5, K6: 12, K7: 7 },
  },
  {
    code: "Mbl11",
    name: "Suzuki Ertiga 1.4 GL Bensin-MT",
    values: { K1: 130, K2: 14, K3: 1373, K4: 7, K5: 8.5, K6: 13, K7: 8.5 },
  },
  {
    code: "Mbl12",
    name: "Suzuki Ignis 1.2 GX AGS Bensin-AT",
    values: { K1: 168, K2: 22, K3: 1197, K4: 5, K5: 7.5, K6: 12, K7: 10 },
  },
  {
    code: "Mbl13",
    name: "Toyota Avanza 1.3 G Bensin-MT",
    values: { K1: 165, K2: 18, K3: 1500, K4: 7, K5: 8.5, K6: 12, K7: 8.5 },
  },
  {
    code: "Mbl14",
    name: "Toyota Fortuner 2.5 G TRD Solar-AT",
    values: { K1: 205, K2: 11, K3: 2982, K4: 7, K5: 7.5, K6: 11, K7: 11.5 },
  },
  {
    code: "Mbl15",
    name: "Toyota Kijang Innova 2.0 V Bensin-AT",
    values: { K1: 269, K2: 18, K3: 2393, K4: 8, K5: 8.5, K6: 12, K7: 10 },
  },
  {
    code: "Mbl16",
    name: "Toyota Raize 1.0 GR Sport Two Tone Bensin-AT",
    values: { K1: 239, K2: 22, K3: 1200, K4: 5, K5: 7.5, K6: 12, K7: 13 },
  },
  {
    code: "Mbl17",
    name: "Toyota Yaris 1.5 TRD Sportivo Bensin-AT",
    values: { K1: 190, K2: 16, K3: 1497, K4: 5, K5: 7.5, K6: 11, K7: 10 },
  },
];

// MOORA Calculation Functions
class MOORACalculator {
  static normalizeMatrix(decisionMatrix) {
    const normalizedMatrix = [];
    const numCriteria = decisionMatrix[0].length;

    const columnSqrtSums = [];
    for (let j = 0; j < numCriteria; j++) {
      let sumOfSquares = 0;
      for (let i = 0; i < decisionMatrix.length; i++) {
        sumOfSquares += Math.pow(decisionMatrix[i][j], 2);
      }
      columnSqrtSums[j] = Math.sqrt(sumOfSquares);
    }

    for (let i = 0; i < decisionMatrix.length; i++) {
      const normalizedRow = [];
      for (let j = 0; j < numCriteria; j++) {
        if (columnSqrtSums[j] === 0) {
          normalizedRow.push(0);
        } else {
          normalizedRow.push(decisionMatrix[i][j] / columnSqrtSums[j]);
        }
      }
      normalizedMatrix.push(normalizedRow);
    }

    return normalizedMatrix;
  }

  static calculatePreferenceScores(
    normalizedMatrix,
    criteriaWeights,
    criteriaTypes,
  ) {
    const preferenceScores = [];

    for (let i = 0; i < normalizedMatrix.length; i++) {
      let sumBenefit = 0;
      let sumCost = 0;

      for (let j = 0; j < normalizedMatrix[i].length; j++) {
        const weightedValue = criteriaWeights[j] * normalizedMatrix[i][j];

        if (criteriaTypes[j] === "benefit") {
          sumBenefit += weightedValue;
        } else if (criteriaTypes[j] === "cost") {
          sumCost += weightedValue;
        }
      }

      preferenceScores.push(sumBenefit - sumCost);
    }

    return preferenceScores;
  }

  static calculateWeightedNormalizedMatrix(normalizedMatrix, criteriaWeights) {
    const weightedMatrix = [];

    for (let i = 0; i < normalizedMatrix.length; i++) {
      const weightedRow = [];
      for (let j = 0; j < normalizedMatrix[i].length; j++) {
        weightedRow.push(normalizedMatrix[i][j] * criteriaWeights[j]);
      }
      weightedMatrix.push(weightedRow);
    }

    return weightedMatrix;
  }

  static rankAlternatives(preferenceScores) {
    const indexedScores = preferenceScores.map((score, index) => ({
      index,
      score,
    }));

    indexedScores.sort((a, b) => b.score - a.score);

    const rankedResults = indexedScores.map((item, rankIndex) => ({
      index: item.index,
      score: item.score,
      rank: rankIndex + 1,
    }));

    return rankedResults;
  }
}

// ==================== ROUTES ====================

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "MOORA DSS API for Used Car Selection",
    version: "1.0.0",
    endpoints: [
      "GET  /api/criteria - Get all criteria",
      "GET  /api/alternatives - Get all alternatives",
      "POST /api/init - Initialize data from jurnal",
      "POST /api/calculate - Calculate MOORA ranking",
      "GET  /api/rankings - Get ranking results",
      "GET  /api/top/:n - Get top N recommendations",
    ],
  });
});

// Initialize data from jurnal
app.post("/api/init", async (req, res) => {
  try {
    await Criteria.deleteMany({});
    await Alternative.deleteMany({});
    await Ranking.deleteMany({});

    await Criteria.insertMany(initialCriteria);
    await Alternative.insertMany(initialAlternatives);

    res.json({
      success: true,
      message: "Data from jurnal imported successfully",
      criteriaCount: initialCriteria.length,
      alternativesCount: initialAlternatives.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CRITERIA ROUTES ====================

// Get all criteria
app.get("/api/criteria", async (req, res) => {
  try {
    const criteria = await Criteria.find().sort("code");
    res.json(criteria);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single criteria by ID
app.get("/api/criteria/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID tidak valid" });
    }

    const criteria = await Criteria.findById(id);
    if (!criteria) {
      return res.status(404).json({ error: "Kriteria tidak ditemukan" });
    }

    res.json(criteria);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new criteria
app.post("/api/criteria", async (req, res) => {
  try {
    const { code, name, attribute, weight, description } = req.body;

    // Validation
    if (!code || !name || !attribute || !weight) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    // Check if code already exists
    const existingCriteria = await Criteria.findOne({ code });
    if (existingCriteria) {
      return res.status(400).json({ error: "Kode kriteria sudah digunakan" });
    }

    const criteria = new Criteria({
      code,
      name,
      attribute,
      weight: parseFloat(weight),
      description,
    });

    await criteria.save();
    res.status(201).json(criteria);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update criteria
app.put("/api/criteria/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, attribute, weight, description } = req.body;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID tidak valid" });
    }

    // Find criteria
    const criteria = await Criteria.findById(id);
    if (!criteria) {
      return res.status(404).json({ error: "Kriteria tidak ditemukan" });
    }

    // Check if new code already exists (if code is being changed)
    if (code && code !== criteria.code) {
      const existingCriteria = await Criteria.findOne({ code });
      if (existingCriteria) {
        return res.status(400).json({ error: "Kode kriteria sudah digunakan" });
      }
    }

    // Update fields
    if (code) criteria.code = code;
    if (name) criteria.name = name;
    if (attribute) criteria.attribute = attribute;
    if (weight) criteria.weight = parseFloat(weight);
    if (description !== undefined) criteria.description = description;

    await criteria.save();
    res.json(criteria);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete criteria - FIXED VERSION
app.delete("/api/criteria/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("DELETE request for criteria ID:", id);

    // Try to delete by ObjectId
    let result;
    if (mongoose.Types.ObjectId.isValid(id)) {
      result = await Criteria.findByIdAndDelete(id);
    }

    // If not found by ObjectId, try by code
    if (!result) {
      result = await Criteria.findOneAndDelete({ code: id });
    }

    if (!result) {
      return res.status(404).json({
        error: "Kriteria tidak ditemukan",
        receivedId: id,
      });
    }

    res.json({
      success: true,
      message: "Kriteria berhasil dihapus",
      deletedCriteria: result,
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ALTERNATIVES ROUTES ====================

// Get all alternatives
app.get("/api/alternatives", async (req, res) => {
  try {
    const alternatives = await Alternative.find().sort("code");
    res.json(alternatives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single alternative by ID
app.get("/api/alternatives/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID tidak valid" });
    }

    const alternative = await Alternative.findById(id);
    if (!alternative) {
      return res.status(404).json({ error: "Alternatif tidak ditemukan" });
    }

    res.json(alternative);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new alternative
app.post("/api/alternatives", async (req, res) => {
  try {
    const { code, name, values, description } = req.body;

    // Validation
    if (!code || !name || !values) {
      return res
        .status(400)
        .json({ error: "Code, name, dan values wajib diisi" });
    }

    // Check if all criteria values are present
    const requiredKeys = ["K1", "K2", "K3", "K4", "K5", "K6", "K7"];
    const hasAllKeys = requiredKeys.every((key) => values.hasOwnProperty(key));

    if (!hasAllKeys) {
      return res.status(400).json({
        error: "Values harus memiliki semua kriteria K1 sampai K7",
      });
    }

    // Check if code already exists
    const existingAlternative = await Alternative.findOne({ code });
    if (existingAlternative) {
      return res.status(400).json({ error: "Kode alternatif sudah digunakan" });
    }

    // Convert values to numbers
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

    await alternative.save();
    res.status(201).json(alternative);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update alternative
app.put("/api/alternatives/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, values, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID tidak valid" });
    }

    const alternative = await Alternative.findById(id);
    if (!alternative) {
      return res.status(404).json({ error: "Alternatif tidak ditemukan" });
    }

    // Check if new code already exists (if code is being changed)
    if (code && code !== alternative.code) {
      const existingAlternative = await Alternative.findOne({ code });
      if (existingAlternative) {
        return res
          .status(400)
          .json({ error: "Kode alternatif sudah digunakan" });
      }
    }

    // Update fields
    if (code) alternative.code = code;
    if (name) alternative.name = name;
    if (description !== undefined) alternative.description = description;

    // Update values if provided
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

    await alternative.save();
    res.json(alternative);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete alternative - FIXED VERSION
app.delete("/api/alternatives/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("DELETE request for alternative ID:", id);

    // Try to delete by ObjectId
    let result;
    if (mongoose.Types.ObjectId.isValid(id)) {
      result = await Alternative.findByIdAndDelete(id);
    }

    // If not found by ObjectId, try by code
    if (!result) {
      result = await Alternative.findOneAndDelete({ code: id });
    }

    if (!result) {
      return res.status(404).json({
        error: "Alternatif tidak ditemukan",
        receivedId: id,
      });
    }

    res.json({
      success: true,
      message: "Alternatif berhasil dihapus",
      deletedAlternative: result,
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== CALCULATION ROUTES ====================

// Calculate MOORA
app.post("/api/calculate", async (req, res) => {
  try {
    // Get data
    const alternatives = await Alternative.find().sort("code");
    const criteria = await Criteria.find().sort("code");

    if (alternatives.length === 0 || criteria.length === 0) {
      return res.status(400).json({
        message: "No data found. Please initialize data first.",
      });
    }

    // 1. Create decision matrix
    const decisionMatrix = alternatives.map((alt) =>
      criteria.map((c) => alt.values[c.code]),
    );

    // 2. Normalize matrix
    const normalizedMatrix = MOORACalculator.normalizeMatrix(decisionMatrix);

    // 3. Prepare criteria data
    const criteriaWeights = criteria.map((c) => c.weight / 100);
    const criteriaTypes = criteria.map((c) => c.attribute);
    const criteriaCodes = criteria.map((c) => c.code);

    // 4. Calculate weighted normalized matrix
    const weightedMatrix = MOORACalculator.calculateWeightedNormalizedMatrix(
      normalizedMatrix,
      criteriaWeights,
    );

    // 5. Calculate preference scores
    const preferenceScores = MOORACalculator.calculatePreferenceScores(
      normalizedMatrix,
      criteriaWeights,
      criteriaTypes,
    );

    // 6. Rank alternatives
    const rankingResults = MOORACalculator.rankAlternatives(preferenceScores);

    // 7. Save rankings to database
    await Ranking.deleteMany({});

    const rankingPromises = rankingResults.map(async (result) => {
      const alternative = alternatives[result.index];

      const normalizedValues = {};
      criteriaCodes.forEach((code, idx) => {
        normalizedValues[code] = normalizedMatrix[result.index][idx];
      });

      const weightedValues = {};
      criteriaCodes.forEach((code, idx) => {
        weightedValues[code] = weightedMatrix[result.index][idx];
      });

      const ranking = new Ranking({
        alternativeId: alternative._id,
        preferenceScore: result.score,
        rank: result.rank,
        normalizedValues,
        weightedValues,
      });

      return ranking.save();
    });

    await Promise.all(rankingPromises);

    // 8. Prepare response
    const response = {
      success: true,
      message: "MOORA calculation completed successfully",
      calculationDate: new Date().toISOString(),
      topRecommendations: rankingResults.slice(0, 5).map((result) => ({
        rank: result.rank,
        code: alternatives[result.index].code,
        name: alternatives[result.index].name,
        score: result.score.toFixed(4),
      })),
      summary: {
        totalAlternatives: alternatives.length,
        totalCriteria: criteria.length,
        bestAlternative: alternatives[rankingResults[0].index].name,
        bestScore: rankingResults[0].score.toFixed(4),
        calculationTime: new Date().toISOString(),
      },
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ranking results
app.get("/api/rankings", async (req, res) => {
  try {
    const rankings = await Ranking.find()
      .populate("alternativeId", "code name values")
      .sort("rank");

    res.json(rankings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top N recommendations
app.get("/api/top/:n", async (req, res) => {
  try {
    const n = parseInt(req.params.n) || 5;
    const rankings = await Ranking.find()
      .populate("alternativeId", "code name values")
      .sort("rank")
      .limit(n);

    res.json(rankings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SERVER START ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(
    `📊 MongoDB: ${process.env.MONGODB_URI || "mongodb://localhost:27017/moora_dss"}`,
  );
  console.log(`\n📋 Available Endpoints:`);
  console.log(`  GET    http://localhost:${PORT}/api/criteria`);
  console.log(`  GET    http://localhost:${PORT}/api/criteria/:id`);
  console.log(`  POST   http://localhost:${PORT}/api/criteria`);
  console.log(`  PUT    http://localhost:${PORT}/api/criteria/:id`);
  console.log(`  DELETE http://localhost:${PORT}/api/criteria/:id`);
  console.log(`  GET    http://localhost:${PORT}/api/alternatives`);
  console.log(`  POST   http://localhost:${PORT}/api/alternatives`);
  console.log(`  PUT    http://localhost:${PORT}/api/alternatives/:id`);
  console.log(`  DELETE http://localhost:${PORT}/api/alternatives/:id`);
  console.log(`  POST   http://localhost:${PORT}/api/init`);
  console.log(`  POST   http://localhost:${PORT}/api/calculate`);
  console.log(`  GET    http://localhost:${PORT}/api/rankings`);
  console.log(`  GET    http://localhost:${PORT}/api/top/:n`);
  console.log(`\n🎯 Example commands:`);
  console.log(`  curl -X POST http://localhost:${PORT}/api/init`);
  console.log(`  curl -X POST http://localhost:${PORT}/api/calculate`);
  console.log(`  curl http://localhost:${PORT}/api/rankings`);
});
