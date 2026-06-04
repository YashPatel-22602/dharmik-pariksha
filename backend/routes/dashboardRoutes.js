const express = require("express");
const router = express.Router();
const {
  getLevelDistribution,
  getYearlyRegistrations,
  getGenderRatio,
} = require("../controllers/dashboardController");

// Level distribution
router.get("/levels", getLevelDistribution);

// Yearly registrations
router.get("/registrations", getYearlyRegistrations);

// Gender ratio
router.get("/gender", getGenderRatio);

module.exports = router;