class MOORACalculator {
  /**
   * Normalisasi matriks keputusan sesuai rumus MOORA
   * @param {Array} decisionMatrix - Matriks keputusan [alternatives][criteria]
   * @returns {Array} Matriks ternormalisasi
   */
  static normalizeMatrix(decisionMatrix) {
    const normalizedMatrix = [];
    const numCriteria = decisionMatrix[0].length;

    // Hitung akar kuadrat dari jumlah kuadrat setiap kolom
    const columnSqrtSums = [];
    for (let j = 0; j < numCriteria; j++) {
      let sumOfSquares = 0;
      for (let i = 0; i < decisionMatrix.length; i++) {
        sumOfSquares += Math.pow(decisionMatrix[i][j], 2);
      }
      columnSqrtSums[j] = Math.sqrt(sumOfSquares);
    }

    // Normalisasi setiap elemen
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

  /**
   * Hitung nilai preferensi berdasarkan MOORA
   * @param {Array} normalizedMatrix - Matriks ternormalisasi
   * @param {Array} criteriaWeights - Bobot kriteria
   * @param {Array} criteriaTypes - Tipe kriteria (benefit/cost)
   * @returns {Array} Nilai preferensi untuk setiap alternatif
   */
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

      // Yi = Σ benefit - Σ cost
      preferenceScores.push(sumBenefit - sumCost);
    }

    return preferenceScores;
  }

  /**
   * Hitung matriks ternormalisasi terbobot
   * @param {Array} normalizedMatrix - Matriks ternormalisasi
   * @param {Array} criteriaWeights - Bobot kriteria
   * @returns {Array} Matriks ternormalisasi terbobot
   */
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

  /**
   * Ranking alternatif berdasarkan nilai preferensi
   * @param {Array} preferenceScores - Nilai preferensi
   * @returns {Array} Ranking [index, score, rank]
   */
  static rankAlternatives(preferenceScores) {
    const indexedScores = preferenceScores.map((score, index) => ({
      index,
      score,
    }));

    // Urutkan descending (nilai tertinggi = ranking terbaik)
    indexedScores.sort((a, b) => b.score - a.score);

    // Tambahkan ranking
    const rankedResults = indexedScores.map((item, rankIndex) => ({
      index: item.index,
      score: item.score,
      rank: rankIndex + 1,
    }));

    return rankedResults;
  }

  /**
   * Hitung akurasi menggunakan Confusion Matrix
   * @param {Array} systemRanking - Ranking dari sistem
   * @param {Array} userRanking - Ranking dari user
   * @param {number} topN - Top N ranking yang dibandingkan
   * @returns {Object} Hasil akurasi
   */
  static calculateAccuracy(systemRanking, userRanking, topN = 3) {
    // Ambil top N dari sistem
    const systemTopN = systemRanking.slice(0, topN).map((item) => item.index);

    // Ambil top N dari user
    const userTopN = userRanking.slice(0, topN).map((item) => item.index);

    // Hitung true positives (intersection)
    const truePositives = systemTopN.filter((index) =>
      userTopN.includes(index),
    ).length;

    // Hitung false positives
    const falsePositives = systemTopN.length - truePositives;

    // Hitung false negatives
    const falseNegatives = userTopN.length - truePositives;

    // Hitung true negatives
    const totalAlternatives = Math.max(
      systemRanking.length,
      userRanking.length,
    );
    const trueNegatives =
      totalAlternatives - (truePositives + falsePositives + falseNegatives);

    // Hitung akurasi
    const accuracy = (truePositives + trueNegatives) / totalAlternatives;

    // Hitung precision
    const precision = truePositives / (truePositives + falsePositives);

    // Hitung recall
    const recall = truePositives / (truePositives + falseNegatives);

    // Hitung F1-Score
    const f1Score = (2 * (precision * recall)) / (precision + recall);

    return {
      accuracy: accuracy * 100,
      precision: precision * 100,
      recall: recall * 100,
      f1Score: f1Score * 100,
      truePositives,
      falsePositives,
      trueNegatives,
      falseNegatives,
      confusionMatrix: {
        systemTopN,
        userTopN,
      },
    };
  }

  /**
   * Hitung bobot kriteria dari multiple stakeholders
   * @param {Array} stakeholderWeights - Bobot dari setiap stakeholder
   * @returns {Object} Hasil perhitungan bobot
   */
  static calculateCriteriaWeights(stakeholderWeights) {
    const numCriteria = stakeholderWeights[0].length;
    const numStakeholders = stakeholderWeights.length;

    // Hitung geometric mean untuk setiap kriteria
    const geometricMeans = [];

    for (let j = 0; j < numCriteria; j++) {
      let product = 1;
      for (let i = 0; i < numStakeholders; i++) {
        product *= stakeholderWeights[i][j];
      }
      geometricMeans[j] = Math.pow(product, 1 / numStakeholders);
    }

    // Hitung total geometric mean
    const totalGeometricMean = geometricMeans.reduce(
      (sum, val) => sum + val,
      0,
    );

    // Normalisasi bobot (dalam persentase)
    const normalizedWeights = geometricMeans.map(
      (mean) => (mean / totalGeometricMean) * 100,
    );

    return {
      geometricMeans,
      totalGeometricMean,
      normalizedWeights,
    };
  }
}

module.exports = MOORACalculator;
