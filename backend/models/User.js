const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    lndId: {
      type: String,
      unique: true,
      required: true
    },

    name: String,
    age: Number,
    gender: String,
    mobileNumber: { type: String, required: true },
    city: String,
    examCenter: String,
    examCenterCode: String,

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    // Password for BOTH user & admin
    password: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
);

userSchema.index({ examCenter: 1 });

module.exports = mongoose.model("User", userSchema);
