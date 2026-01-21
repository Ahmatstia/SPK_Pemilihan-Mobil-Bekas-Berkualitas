const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Load environment variables
dotenv.config();

// Import routes
const criteriaRoutes = require("./routes/criteriaRoutes");
const alternativeRoutes = require("./routes/alternativeRoutes");
const calculationRoutes = require("./routes/calculationRoutes");
const rankingRoutes = require("./routes/rankingRoutes");

// Import initial data
const { initialCriteria, initialAlternatives } = require("./data/initialData");

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use("/api/criteria", criteriaRoutes);
app.use("/api/alternatives", alternativeRoutes);
app.use("/api/calculations", calculationRoutes);
app.use("/api/rankings", rankingRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "MOORA DSS API for Used Car Selection",
    version: "1.0.0",
    endpoints: {
      criteria: "/api/criteria",
      alternatives: "/api/alternatives",
      calculations: "/api/calculations",
      rankings: "/api/rankings",
    },
    documentation:
      "This API implements MOORA method for used car selection DSS",
  });
});

// Initialize data route
app.post("/api/init-data", async (req, res) => {
  try {
    const Criteria = require("./models/Criteria");
    const Alternative = require("./models/Alternative");

    // Clear existing data
    await Criteria.deleteMany({});
    await Alternative.deleteMany({});

    // Insert initial data
    const criteriaResult = await Criteria.insertMany(initialCriteria);
    const alternativesResult =
      await Alternative.insertMany(initialAlternatives);

    res.json({
      message: "Initial data loaded successfully",
      criteria: {
        count: criteriaResult.length,
        data: criteriaResult,
      },
      alternatives: {
        count: alternativesResult.length,
        data: alternativesResult,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`\nAvailable Endpoints:`);
  console.log(`  GET  /api/criteria - Get all criteria`);
  console.log(`  POST /api/criteria/import-initial - Import initial criteria`);
  console.log(`  GET  /api/alternatives - Get all alternatives`);
  console.log(
    `  POST /api/alternatives/import-initial - Import initial alternatives`,
  );
  console.log(`  POST /api/calculations/complete - Calculate MOORA`);
  console.log(`  POST /api/init-data - Initialize all data from jurnal`);
});
