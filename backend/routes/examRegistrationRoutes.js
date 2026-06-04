const express = require("express");
const router = express.Router();

const { registerExam } = require("../controllers/examRegistrationController");

router.post("/register", authMiddleware, async (req, res) => {
  try {

    const userId = req.user.id;

    // ✅ Prevent duplicate
    const existing = await Registration.findOne({ userId });
    if (existing) {
      return res.status(400).json({ message: "Already registered" });
    }

    const newRegistration = new Registration({
      userId,
      ...req.body,
      year: new Date().getFullYear()
    });

    await newRegistration.save();

    res.json({ message: "Registered successfully" });

  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});
module.exports = router;