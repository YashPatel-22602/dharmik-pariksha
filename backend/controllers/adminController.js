const xlsx = require("xlsx");
const User = require("../models/User");
const ExamRegistered = require("../models/Registration");
const Result = require("../models/Result");
const ExcelJS = require("exceljs");
const archiver = require("archiver");

exports.uploadLegacyUsers = async (req, res) => {

try {

const workbook = xlsx.readFile(req.file.path);

const sheet = workbook.Sheets[workbook.SheetNames[0]];

const rows = xlsx.utils.sheet_to_json(sheet);

const users = rows.map(row => ({

lndId: row.LNDID,

name: row.Name,

age: row.Age,

gender: row.Gender,

mobileNumber: row["Mobile Number"],

examCenter: row["Exam Center"],

role: "user"

}));

await User.insertMany(users);

res.json({
message: "Legacy users uploaded successfully"
});

} catch (error) {

console.error(error);

res.status(500).json({
message: "Upload failed"
});

}

};

exports.uploadMarks = async (req, res) => {

try {

const workbook = xlsx.readFile(req.file.path);

const sheet = workbook.Sheets[workbook.SheetNames[0]];

const rows = xlsx.utils.sheet_to_json(sheet);

const results = rows.map(row => ({

lndId: row.LNDID,
name: row.Name,

examLevel: Number(row.Level),
examYear: Number(row.Year),

marks: Number(row.Marks),

submittedAt: new Date(row.SubmittedAt)

}));

await Result.insertMany(results);

res.json({
message: "Marks uploaded successfully"
});

} catch (error) {

console.error(error);

res.status(500).json({
message: "Upload failed"
});

}
};

exports.downloadUsersByCenter = async (req, res) => {
  try {
    const users = await User.find();

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    // Group users by exam center
    const grouped = {};

    users.forEach(user => {
      const center = user.examCenter || "Unknown";

      if (!grouped[center]) {
        grouped[center] = [];
      }

      grouped[center].push(user);
    });

    // Set response headers for ZIP
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=centers.zip");

    const archive = archiver("zip");
    archive.pipe(res);

    // Create Excel for each center
    for (const center in grouped) {

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(center);

      worksheet.columns = [
        { header: "LND ID", key: "lndId", width: 20 },
        { header: "Name", key: "name", width: 25 },
        { header: "Age", key: "age", width: 10 },
        { header: "Gender", key: "gender", width: 15 },
        { header: "Mobile", key: "mobileNumber", width: 20 },
        { header: "Exam Center", key: "examCenter", width: 20 }
      ];

      grouped[center].forEach(user => {
        worksheet.addRow({
          lndId: user.lndId,
          name: user.name,
          age: user.age,
          gender: user.gender,
          mobileNumber: user.mobileNumber,
          examCenter: user.examCenter
        });
      });

      // Convert to buffer
      const buffer = await workbook.xlsx.writeBuffer();

      archive.append(buffer, { name: `${center}.xlsx` });
    }

    await archive.finalize();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating zip" });
  }
};

const RegistrationStatus = require("../models/RegistrationStatus");
// Toggle Registration
exports.toggleRegistration = async (req, res) => {
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
      isOpen: status.isOpen,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Status
exports.getRegistrationStatus = async (req, res) => {
  try {
    let reg = await Registration.findOne();

    if (!reg) {
      reg = { isOpen: false };
    }

    res.json(reg);

  } catch (err) {
    res.status(500).json({ message: "Error fetching status" });
  }
};

exports.downloadUserRegForExam = async (req, res) => {
  try {
    const users = await ExamRegistered.find();

    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    // Group users by exam center
    const grouped = {};

    users.forEach(user => {
      const center = user.center || "Unknown";

      if (!grouped[center]) {
        grouped[center] = [];
      }

      grouped[center].push(user);
    });

    // Set response headers for ZIP
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=User_Reg_For_exam.zip");

    const archive = archiver("zip");
    archive.pipe(res);

    // Create Excel for each center
    for (const center in grouped) {

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(center);

      worksheet.columns = [
        { header: "LND ID", key: "lndId", width: 20 },
        { header: "Name", key: "name", width: 25 },
        { header: "Level", key: "level", width: 10 },
        { header: "Year", key: "year", width: 15 },
        { header: "Exam Center", key: "examCenter", width: 20 }

      ];

      grouped[center].forEach(user => {
        worksheet.addRow({
          lndId: user.lndId,
          name: user.name,
          level: user.level,
          year: user.year,
          examCenter : user.center
        });
      });

      // Convert to buffer
      const buffer = await workbook.xlsx.writeBuffer();

      archive.append(buffer, { name: `${center}.xlsx` });
    }

    await archive.finalize();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating zip" });
  }
};