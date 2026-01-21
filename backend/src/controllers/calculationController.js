const Alternative = require("../models/Alternative");
const Criteria = require("../models/Criteria");
const Ranking = require("../models/Ranking");
const MOORACalculator = require("../utils/mooraCalculator");

// @desc    Calculate MOORA step by step
// @route   POST /api/calculations/step-by-step
// @access  Public
const calculateMOORAStepByStep = async (req, res) => {
  try {
    // Ambil data dari database
    const alternatives = await Alternative.find().sort("code");
    const criteria = await Criteria.find().sort("code");

    if (alternatives.length === 0 || criteria.length === 0) {
      return res.status(400).json({
        message:
          "No alternatives or criteria found. Please import initial data first.",
      });
    }

    // 1. Buat matriks keputusan
    const decisionMatrix = alternatives.map((alt) =>
      criteria.map((c) => alt.values[c.code]),
    );

    // 2. Normalisasi matriks
    const normalizedMatrix = MOORACalculator.normalizeMatrix(decisionMatrix);

    // 3. Siapkan data kriteria untuk perhitungan
    const criteriaWeights = criteria.map((c) => c.weight / 100); // Konversi ke desimal
    const criteriaTypes = criteria.map((c) => c.attribute);
    const criteriaCodes = criteria.map((c) => c.code);

    // 4. Hitung matriks ternormalisasi terbobot
    const weightedMatrix = MOORACalculator.calculateWeightedNormalizedMatrix(
      normalizedMatrix,
      criteriaWeights,
    );

    // 5. Hitung nilai preferensi
    const preferenceScores = MOORACalculator.calculatePreferenceScores(
      normalizedMatrix,
      criteriaWeights,
      criteriaTypes,
    );

    // 6. Ranking alternatif
    const rankingResults = MOORACalculator.rankAlternatives(preferenceScores);

    // 7. Format hasil untuk response
    const stepResults = {
      step1: {
        name: "Decision Matrix",
        data: decisionMatrix,
        description: "Matriks keputusan awal dari data alternatif",
      },
      step2: {
        name: "Normalized Matrix",
        data: normalizedMatrix,
        description: "Matriks ternormalisasi menggunakan rumus MOORA",
      },
      step3: {
        name: "Weighted Normalized Matrix",
        data: weightedMatrix,
        description: "Matriks ternormalisasi terbobot",
      },
      step4: {
        name: "Preference Scores",
        data: preferenceScores.map((score, idx) => ({
          alternativeCode: alternatives[idx].code,
          alternativeName: alternatives[idx].name,
          score: score,
        })),
        description: "Nilai preferensi (Yi = Σ benefit - Σ cost)",
      },
      step5: {
        name: "Ranking Results",
        data: rankingResults.map((result) => ({
          rank: result.rank,
          alternativeCode: alternatives[result.index].code,
          alternativeName: alternatives[result.index].name,
          score: result.score,
          originalIndex: result.index,
        })),
        description: "Hasil ranking berdasarkan nilai preferensi",
      },
      metadata: {
        totalAlternatives: alternatives.length,
        totalCriteria: criteria.length,
        calculationDate: new Date().toISOString(),
      },
    };

    res.json(stepResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Calculate complete MOORA ranking
// @route   POST /api/calculations/complete
// @access  Public
const calculateCompleteMOORA = async (req, res) => {
  try {
    const { stakeholderWeights } = req.body;

    // Ambil data dari database
    const alternatives = await Alternative.find().sort("code");
    const criteria = await Criteria.find().sort("code");

    if (alternatives.length === 0 || criteria.length === 0) {
      return res.status(400).json({
        message:
          "No alternatives or criteria found. Please import initial data first.",
      });
    }

    // Gunakan bobot stakeholder jika disediakan, atau gunakan bobot dari database
    let finalWeights;
    if (stakeholderWeights && stakeholderWeights.length > 0) {
      // Hitung bobot menggunakan geometric mean dari multiple stakeholders
      const weightCalculation =
        MOORACalculator.calculateCriteriaWeights(stakeholderWeights);
      finalWeights = weightCalculation.normalizedWeights.map((w) => w / 100);
    } else {
      // Gunakan bobot dari database
      finalWeights = criteria.map((c) => c.weight / 100);
    }

    // 1. Buat matriks keputusan
    const decisionMatrix = alternatives.map((alt) =>
      criteria.map((c) => alt.values[c.code]),
    );

    // 2. Normalisasi matriks
    const normalizedMatrix = MOORACalculator.normalizeMatrix(decisionMatrix);

    // 3. Siapkan data kriteria
    const criteriaTypes = criteria.map((c) => c.attribute);
    const criteriaCodes = criteria.map((c) => c.code);

    // 4. Hitung matriks ternormalisasi terbobot
    const weightedMatrix = MOORACalculator.calculateWeightedNormalizedMatrix(
      normalizedMatrix,
      finalWeights,
    );

    // 5. Hitung nilai preferensi
    const preferenceScores = MOORACalculator.calculatePreferenceScores(
      normalizedMatrix,
      finalWeights,
      criteriaTypes,
    );

    // 6. Ranking alternatif
    const rankingResults = MOORACalculator.rankAlternatives(preferenceScores);

    // 7. Simpan hasil ranking ke database
    await Ranking.deleteMany({}); // Hapus ranking lama

    const rankingDocuments = rankingResults.map((result) => {
      const alternative = alternatives[result.index];

      // Buat normalized values map
      const normalizedValues = {};
      criteriaCodes.forEach((code, idx) => {
        normalizedValues[code] = normalizedMatrix[result.index][idx];
      });

      // Buat weighted values map
      const weightedValues = {};
      criteriaCodes.forEach((code, idx) => {
        weightedValues[code] = weightedMatrix[result.index][idx];
      });

      return new Ranking({
        alternativeId: alternative._id,
        preferenceScore: result.score,
        rank: result.rank,
        normalizedValues,
        weightedValues,
      });
    });

    await Ranking.insertMany(rankingDocuments);

    // 8. Format hasil untuk response
    const completeResults = {
      alternatives: alternatives.map((alt, idx) => ({
        code: alt.code,
        name: alt.name,
        values: alt.values,
        normalizedValues: criteriaCodes.reduce((obj, code, cIdx) => {
          obj[code] = normalizedMatrix[idx][cIdx];
          return obj;
        }, {}),
        weightedValues: criteriaCodes.reduce((obj, code, cIdx) => {
          obj[code] = weightedMatrix[idx][cIdx];
          return obj;
        }, {}),
        preferenceScore: preferenceScores[idx],
        rank: rankingResults.find((r) => r.index === idx)?.rank || 0,
      })),
      criteria: criteria.map((c, idx) => ({
        code: c.code,
        name: c.name,
        attribute: c.attribute,
        weight: finalWeights[idx] * 100, // Konversi kembali ke persentase
        normalizedWeight: finalWeights[idx],
      })),
      topRecommendations: rankingResults.slice(0, 5).map((result) => ({
        rank: result.rank,
        alternativeCode: alternatives[result.index].code,
        alternativeName: alternatives[result.index].name,
        score: result.score,
        values: alternatives[result.index].values,
      })),
      summary: {
        totalAlternatives: alternatives.length,
        totalCriteria: criteria.length,
        bestAlternative: alternatives[rankingResults[0].index].name,
        bestScore: rankingResults[0].score,
        calculationDate: new Date().toISOString(),
      },
    };

    res.json(completeResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Calculate accuracy using Confusion Matrix
// @route   POST /api/calculations/accuracy
// @access  Public
const calculateAccuracy = async (req, res) => {
  try {
    const { userRanking, topN = 3 } = req.body;

    // Ambil ranking dari sistem
    const systemRankings = await Ranking.find()
      .populate("alternativeId", "code name")
      .sort("rank");

    if (systemRankings.length === 0) {
      return res.status(400).json({
        message: "No system rankings found. Please calculate MOORA first.",
      });
    }

    // Format system ranking untuk perhitungan
    const systemRankingForCalc = systemRankings.map((rank, index) => ({
      index: index,
      score: rank.preferenceScore,
      rank: rank.rank,
    }));

    // Hitung akurasi
    const accuracyResults = MOORACalculator.calculateAccuracy(
      systemRankingForCalc,
      userRanking,
      topN,
    );

    // Format response
    const response = {
      accuracy: accuracyResults.accuracy.toFixed(2) + "%",
      precision: accuracyResults.precision.toFixed(2) + "%",
      recall: accuracyResults.recall.toFixed(2) + "%",
      f1Score: accuracyResults.f1Score.toFixed(2) + "%",
      confusionMatrix: {
        truePositives: accuracyResults.truePositives,
        falsePositives: accuracyResults.falsePositives,
        trueNegatives: accuracyResults.trueNegatives,
        falseNegatives: accuracyResults.falseNegatives,
      },
      topN: topN,
      systemTopN: accuracyResults.confusionMatrix.systemTopN.map(
        (idx) => systemRankings[idx].alternativeId.name,
      ),
      userTopN: accuracyResults.confusionMatrix.userTopN.map(
        (idx) => userRanking[idx]?.name || `Alternative ${idx + 1}`,
      ),
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get calculation summary
// @route   GET /api/calculations/summary
// @access  Public
const getCalculationSummary = async (req, res) => {
  try {
    const alternatives = await Alternative.countDocuments();
    const criteria = await Criteria.countDocuments();
    const rankings = await Ranking.countDocuments();

    const latestRanking = await Ranking.findOne()
      .populate("alternativeId", "code name")
      .sort("-calculationDate");

    res.json({
      alternativesCount: alternatives,
      criteriaCount: criteria,
      rankingsCount: rankings,
      lastCalculation: latestRanking?.calculationDate || null,
      bestAlternative: latestRanking
        ? {
            name: latestRanking.alternativeId.name,
            score: latestRanking.preferenceScore,
            rank: latestRanking.rank,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  calculateMOORAStepByStep,
  calculateCompleteMOORA,
  calculateAccuracy,
  getCalculationSummary,
};
