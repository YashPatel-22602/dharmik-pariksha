const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema(
{
  lndId: {
    type: String,
    required: true
  },

  name: {
    type: String,
    required: true
  },

  level: {
    type: Number,
    enum: [0,1,2],
    required: true
  },

  year: {
    type: Number,
    required: true
  },

  marks: {
    type: Number,
    required: true
  },

  submittedAt: {
    type: Date,
    required: true
  }

},
{ timestamps:true }
);

// Ranking Index
marksSchema.index({ level:1, year:1, marks:-1, submittedAt:1 });

module.exports = mongoose.model("Marks", marksSchema);