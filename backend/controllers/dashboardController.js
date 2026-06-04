const User = require("../models/User");
const ExamResult = require("../models/examResults");

// 1️⃣ Level Distribution
exports.getLevelDistribution = async (req, res) => {
  try {

    const count = await ExamResult.countDocuments();

    console.log("Exam Results Count:", count);

    const data = await ExamResult.aggregate([
      {
        $group: {
          _id: "$level",
          count: { $sum: 1 }
        }
      }
    ]);

    console.log("Level Data:", data);

    res.json(data);

  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

// 2️⃣ Yearly Registration
exports.getYearlyRegistrations = async (req, res) => {
  try {
    const data = await User.aggregate([
      {
        $group: {
          _id: { $year: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching yearly registrations", error });
  }
};

// 3️⃣ Gender Ratio
exports.getGenderRatio = async (req, res) => {
  try {
    const data = await User.aggregate([
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching gender ratio", error });
  }
};