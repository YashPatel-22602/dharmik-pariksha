const XLSX = require("xlsx");
const User = require("../models/User");
const ExamResult = require("../models/examResults");

exports.uploadMarks = async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetName]
    );

    for (let row of sheetData) {
      const { lndId, marks, level, year } = row;

      // Find user
      const user = await User.findOne({ lndId });

      if (!user) continue;

      // Insert exam result
      await ExamResult.create({
        user: user._id,
        lndId,
        level,
        marks,
        year,
      });
    }

    res.json({ message: "Marks uploaded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error });
  }
};