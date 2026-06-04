const mongoose = require("mongoose");

const examRegistrationSchema = new mongoose.Schema({
  lndId: String,
  name: String,
  age: Number,
  gender: String,
  level: String, // optional if not appearing
  year: Number,
  isAppearing: Boolean
}, { timestamps: true });

module.exports = mongoose.model("ExamRegistration", examRegistrationSchema);