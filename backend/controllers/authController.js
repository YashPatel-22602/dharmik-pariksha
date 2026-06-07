const User = require("../models/User");
const generateLndId = require("../utils/generateLndId");
const examCenterCodes = require("../config/examCenterCodes");
const jwt = require("jsonwebtoken");
const sendSms = require("../utils/sendSms");


// ======================
// USER REGISTRATION
// ======================
const registerUser = async (req, res) => {
  try {
    const { name, age, gender, mobileNumber, city, examCenter } = req.body;

    if (!examCenter) {
      return res.status(400).json({ message: "Exam center is required" });
    }

    const centerKey = examCenter.toLowerCase();

    if (!examCenterCodes[centerKey]) {
      return res.status(400).json({ message: "Invalid exam center" });
    }

    const centerCode = examCenterCodes[centerKey];
    const lndId = (await generateLndId(centerCode)).toUpperCase();
    const existingUser = await User.findOne({
        name,
      mobileNumber
    });

    if (existingUser) {

      return res.status(400).json({
        message:
          "User already registered"
      });

}

    await User.create({
      lndId,
      name,
      age,
      gender,
      mobileNumber,
      city,
      examCenter,
      examCenterCode: centerCode,
      role: "user"
    });

    console.log("Mobile:", mobileNumber);
    const smsMessage = `Registration successful. Your LND ID is ${lndId}`;
        console.log("Message:", smsMessage);

    //sendSms(mobileNumber, smsMessage);
    const smsResult = await sendSms(mobileNumber, smsMessage);

console.log("SMS RESULT:", smsResult);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      lndId
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ======================
// LOGIN (USER + ADMIN)
// ======================
const loginUser = async (req, res) => {
  try {
    const { lndId, loginType } = req.body;

    if (!lndId || !loginType) {
      return res.status(400).json({
        message: "LND ID and login type are required"
      });
    }

    const normalizedLndId = lndId.trim().toUpperCase();

    const user = await User.findOne({
      lndId: normalizedLndId,
      role: loginType
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        lndId: user.lndId,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ======================
// GET LOGGED IN USER
// ======================
const getMe = async (req, res) => {
  res.json(req.user);
};


// ✅ IMPORTANT: Export properly
module.exports = {
  registerUser,
  loginUser,
  getMe
};