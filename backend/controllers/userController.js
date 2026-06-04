const ExamRegistration = require("../models/ExamRegistration");
const Registration = require("../models/Registration");

// Submit Exam Registration
exports.registerForExam = async (req, res) => {
  try {
    const regStatus = await Registration.findOne();

    if (!regStatus || !regStatus.isOpen) {
      return res.status(400).json({ message: "Registration is closed" });
    }

    const { lndId, name, age, gender, level, willAppear } = req.body;

    const existing = await ExamRegistration.findOne({ lndId, year: new Date().getFullYear() });

    if (existing) {
      return res.status(400).json({ message: "Already registered" });
    }

    const newReg = new ExamRegistration({
      lndId,
      name,
      age,
      gender,
      level,
      year: new Date().getFullYear(),
      willAppear
    });

    await newReg.save();

    res.json({ message: "Registration successful" });

  } catch (err) {
    res.status(500).json({ message: "Error registering" });
  }
};