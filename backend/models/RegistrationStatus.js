const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  isOpen: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("RegistrationStatus", schema);