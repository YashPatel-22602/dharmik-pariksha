const mongoose = require("mongoose");
const xlsx = require("xlsx");
require("dotenv").config();

const User = require("../models/User");
const Counter = require("../models/Counter");

// 1️⃣ Connect to MongoDB
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected for Excel Import");
};

// 2️⃣ Read Excel File
const readExcelFile = () => {
  const workbook = xlsx.readFile("./data/users.xlsx");
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  return xlsx.utils.sheet_to_json(sheet);
};

// 3️⃣ Import Logic
const importUsers = async () => {
  await connectDB();

  const users = readExcelFile();

  console.log(`Found ${users.length} users in Excel`);

  for (const user of users) {
    const { lndId, name, age, gender, mobileNumber, city, examCenter } = user;

    // Extract exam center code
    const centerCode = lndId.substring(5, 8);
    const numberPart = parseInt(lndId.substring(8), 10);

    // Check if user already exists
    const existingUser = await User.findOne({ lndId });

    if (!existingUser) {
      await User.create({
        lndId,
        name,
        age,
        gender,
        mobileNumber,
        city,
        examCenter,
        examCenterCode: centerCode
      });
    }

    // Update counter safely
    await Counter.updateOne(
      { centerCode },
      { $max: { lastNumber: numberPart } },
      { upsert: true }
    );
  }

  console.log("Excel import completed successfully");
  process.exit();
};

// 4️⃣ Start Import
importUsers();
