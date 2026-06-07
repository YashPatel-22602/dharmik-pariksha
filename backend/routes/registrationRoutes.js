const express = require("express");
const router = express.Router();

const RegistrationStatus = require("../models/RegistrationStatus");
const Registration = require("../models/Registration");
const currentYear = new Date().getFullYear();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");


// ✅ CHECK REGISTRATION STATUS (USED IN DASHBOARD)
router.get("/check", authMiddleware, async (req, res) => {
  try {

    const currentYear = new Date().getFullYear();

    let status = await RegistrationStatus.findOne();

    const registration = await Registration.findOne({
      lndId: req.user.lndId,
      year: currentYear   // ✅ IMPORTANT

    });

    res.json({
      isOpen: status?.isOpen || false,
      registered: !!registration,
      level: registration?.level || null
    });

  } catch (error) {
    console.error("CHECK ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ GET REGISTRATION STATUS
router.get("/status", async (req, res) => {
  try {
    let status = await RegistrationStatus.findOne();

    if (!status) {
      status = new RegistrationStatus({ isOpen: false });
      await status.save();
    }

    res.json({ isOpen: status.isOpen });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ TOGGLE REGISTRATION (ADMIN)
router.post("/toggle", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    let status = await RegistrationStatus.findOne();

    if (!status) {
      status = new RegistrationStatus({ isOpen: true });
    } else {
      status.isOpen = !status.isOpen;
    }

    await status.save();

    res.json({
      success: true,
      isOpen: status.isOpen
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ SUBMIT EXAM REGISTRATION
router.post("/register", authMiddleware, async (req, res) => {
  try {

    // ❌ STEP 1: block empty submission
    if (!req.body.isAppearing) {
      return res.status(400).json({
        message: "Please select 'I want to appear for exam'",
      });
    }

    // 🔒 STEP 2: check if registration is open
    let status = await RegistrationStatus.findOne();

    if (!status || !status.isOpen) {
      return res.status(403).json({
        message: "Exam registration is closed",
      });
    }



    // ❌ STEP 3: prevent duplicate (same user)
const registration = await Registration.findOne({
  user: req.user._id,
  year: currentYear
});

    if (registration) {
      return res.status(400).json({
        message: "You have already registered for the exam",
      });
    }

    // ✅ STEP 4: create clean registration
    const newRegistration = new Registration({
      user: req.user._id,
      lndId: req.body.lndId,
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      level: req.body.level,
      isAppearing: true,
      year: currentYear,
      center: req.body.center  // ✅ ADD
    });

    console.log(newRegistration);


    await newRegistration.save();

    res.json({
      success: true,
      message: "Registration successful",
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      message: "Registration failed",
    });
  }
});

const Result = require("../models/Result");

router.get(
  "/available-levels",
  authMiddleware,
  async (req, res) => {

    try {

      const latestResult =
        await Result.findOne({
          lndId: req.user.lndId
        }).sort({ examYear: -1 });

      console.log("LATEST RESULT:", latestResult);

      let levels = [];

      // NEW USER
      if (!latestResult) {

        levels = [
          "Basic",
          "Level 1",
          "Level 2"
        ];
      }

      // Basic Passed
      else if (
        latestResult.examLevel === "Basic"
      ) {

        levels = ["Level 1"];
      }

      // Level 1 Passed
      else if (
        latestResult.examLevel === "1"
      ) {

        levels = ["Level 2"];
      }

      // Level 2 Passed
      else if (
        latestResult.examLevel === "2"
      ) {

        levels = ["Level 3"];
      }

      // Level 3 Passed
      else if (
        latestResult.examLevel === "3"
      ) {

        levels = ["Level 3"];
      }

      else {

        levels = [
          "Basic",
          "Level 1",
          "Level 2"
        ];
      }

      res.json({
        success: true,
        levels
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message: "Server Error"
      });

    }

  }
);

module.exports = router;