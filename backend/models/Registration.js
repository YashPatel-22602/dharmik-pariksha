const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  lndId: String,
  name: String,
  age: Number,
  gender: String,
  level: String,
  isAppearing: Boolean,
  year: {
  type: Number,
  default: () => new Date().getFullYear()
},
center: {
  type: String,
  required: true
}
});

registrationSchema.index(
  { user: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model("Registration", registrationSchema);