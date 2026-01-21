// Data kriteria dari jurnal
const initialCriteria = [
  {
    code: "K1",
    name: "Harga",
    attribute: "cost", // Semakin rendah semakin baik
    weight: 21.06,
    description: "Harga mobil bekas dalam juta rupiah",
  },
  {
    code: "K2",
    name: "Tahun Produksi",
    attribute: "benefit", // Semakin baru semakin baik
    weight: 19.52,
    description: "Tahun produksi mobil (semakin baru semakin baik)",
  },
  {
    code: "K3",
    name: "Kapasitas Mesin",
    attribute: "benefit", // Semakin besar semakin baik (untuk performa)
    weight: 7.99,
    description: "Kapasitas mesin dalam cc",
  },
  {
    code: "K4",
    name: "Kapasitas Penumpang",
    attribute: "benefit", // Semakin banyak semakin baik
    weight: 13.33,
    description: "Jumlah penumpang yang dapat diangkut",
  },
  {
    code: "K5",
    name: "Pemeliharaan",
    attribute: "benefit", // Skor pemeliharaan (semakin tinggi semakin baik)
    weight: 16.79,
    description: "Kemudahan dan biaya pemeliharaan",
  },
  {
    code: "K6",
    name: "Suku Cadang",
    attribute: "benefit", // Semakin mudah didapat semakin baik
    weight: 15.64,
    description: "Ketersediaan dan harga suku cadang",
  },
  {
    code: "K7",
    name: "Layanan Aftersales",
    attribute: "benefit", // Semakin baik layanan semakin baik
    weight: 5.67,
    description: "Kualitas layanan purna jual",
  },
];

// Data alternatif dari jurnal (17 mobil bekas)
const initialAlternatives = [
  {
    code: "Mbl01",
    name: "BMW 320i 2.0 F30 Sport Bensin-AT",
    values: {
      K1: 329, // Harga
      K2: 13, // Tahun Produksi
      K3: 1997, // Kapasitas Mesin
      K4: 5, // Kapasitas Penumpang
      K5: 5, // Pemeliharaan
      K6: 11, // Suku Cadang
      K7: 11, // Layanan Aftersales
    },
  },
  {
    code: "Mbl02",
    name: "Daihatsu Terios 1.5 TX Adventure",
    values: {
      K1: 150,
      K2: 13,
      K3: 1495,
      K4: 7,
      K5: 8.5,
      K6: 12,
      K7: 8.5,
    },
  },
  {
    code: "Mbl03",
    name: "Daihatsu Xenia 1.3 R Sporty",
    values: {
      K1: 183,
      K2: 19,
      K3: 1500,
      K4: 7,
      K5: 7.5,
      K6: 12.5,
      K7: 7,
    },
  },
  {
    code: "Mbl04",
    name: "Ford Fiesta 1.0 EcoBoost S",
    values: {
      K1: 139,
      K2: 14,
      K3: 1500,
      K4: 5,
      K5: 6.5,
      K6: 11,
      K7: 5.5,
    },
  },
  {
    code: "Mbl05",
    name: "Honda CRV 1.5 Turbo",
    values: {
      K1: 405,
      K2: 19,
      K3: 2354,
      K4: 5,
      K5: 8.5,
      K6: 11,
      K7: 11.5,
    },
  },
  {
    code: "Mbl06",
    name: "Honda HRV 1.8 Prestige",
    values: {
      K1: 255,
      K2: 18,
      K3: 1500,
      K4: 5,
      K5: 7.5,
      K6: 12,
      K7: 13,
    },
  },
  {
    code: "Mbl07",
    name: "Honda Jazz GK-AT",
    values: {
      K1: 205,
      K2: 15,
      K3: 1500,
      K4: 5,
      K5: 7.5,
      K6: 12,
      K7: 10,
    },
  },
  {
    code: "Mbl08",
    name: "Mitsubishi Pajero Sport 2.4 Dakar",
    values: {
      K1: 475,
      K2: 19,
      K3: 2442,
      K4: 7,
      K5: 7.5,
      K6: 11,
      K7: 11.5,
    },
  },
  {
    code: "Mbl09",
    name: "Mitsubishi Xpander 1.5 Cross Premium",
    values: {
      K1: 265,
      K2: 21,
      K3: 1499,
      K4: 7,
      K5: 7.5,
      K6: 12,
      K7: 13,
    },
  },
  {
    code: "Mbl10",
    name: "Suzuki APV 1.5 Luxury",
    values: {
      K1: 110,
      K2: 12,
      K3: 1490,
      K4: 9,
      K5: 8.5,
      K6: 12,
      K7: 7,
    },
  },
  {
    code: "Mbl11",
    name: "Suzuki Ertiga 1.4 GL",
    values: {
      K1: 130,
      K2: 14,
      K3: 1373,
      K4: 7,
      K5: 8.5,
      K6: 13,
      K7: 8.5,
    },
  },
  {
    code: "Mbl12",
    name: "Suzuki Ignis 1.2 GX AGS",
    values: {
      K1: 168,
      K2: 22,
      K3: 1197,
      K4: 5,
      K5: 7.5,
      K6: 12,
      K7: 10,
    },
  },
  {
    code: "Mbl13",
    name: "Toyota Avanza 1.3 G",
    values: {
      K1: 165,
      K2: 18,
      K3: 1500,
      K4: 7,
      K5: 8.5,
      K6: 12,
      K7: 8.5,
    },
  },
  {
    code: "Mbl14",
    name: "Toyota Fortuner 2.5 G TRD",
    values: {
      K1: 205,
      K2: 11,
      K3: 2982,
      K4: 7,
      K5: 7.5,
      K6: 11,
      K7: 11.5,
    },
  },
  {
    code: "Mbl15",
    name: "Toyota Kijang Innova 2.0 V",
    values: {
      K1: 269,
      K2: 18,
      K3: 2393,
      K4: 8,
      K5: 8.5,
      K6: 12,
      K7: 10,
    },
  },
  {
    code: "Mbl16",
    name: "Toyota Raize 1.0 GR Sport",
    values: {
      K1: 239,
      K2: 22,
      K3: 1200,
      K4: 5,
      K5: 7.5,
      K6: 12,
      K7: 13,
    },
  },
  {
    code: "Mbl17",
    name: "Toyota Yaris 1.5 TRD Sportivo",
    values: {
      K1: 190,
      K2: 16,
      K3: 1497,
      K4: 5,
      K5: 7.5,
      K6: 11,
      K7: 10,
    },
  },
];

// Data bobot dari stakeholders (dari jurnal)
const initialStakeholderWeights = [
  [90, 85, 30, 50, 65, 70, 20], // Pembeli 01
  [90, 80, 35, 65, 75, 75, 25], // Pembeli 02
  [95, 90, 40, 60, 80, 60, 30], // Pembeli 03
];

module.exports = {
  initialCriteria,
  initialAlternatives,
  initialStakeholderWeights,
};
