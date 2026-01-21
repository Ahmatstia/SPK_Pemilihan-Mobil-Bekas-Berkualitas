const mongoose = require("mongoose");

const alternativeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  values: {
    K1: { type: Number, required: true }, // Harga
    K2: { type: Number, required: true }, // Tahun Produksi
    K3: { type: Number, required: true }, // Kapasitas Mesin
    K4: { type: Number, required: true }, // Kapasitas Penumpang
    K5: { type: Number, required: true }, // Pemeliharaan
    K6: { type: Number, required: true }, // Suku Cadang
    K7: { type: Number, required: true }, // Layanan Aftersales
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Alternative", alternativeSchema);
