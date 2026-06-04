const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  centerCode: {
    type: String,
    unique: true,
    required: true
  },
  lastNumber: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Counter", counterSchema);
