const mongoose = require("mongoose");

const examResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lndId: {
      type: String,
      required: true,
    },

    level: {
      type: Number,
      enum: [1, 2, 3],
      required: true,
    },

    marks: {
      type: Number,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExamResult", examResultSchema);