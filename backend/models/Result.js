const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
{
lndId: {
type: String,
required: true,
index: true
},

name: String,

examLevel: {
type: Number,
required: true
},

examYear: {
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
{ timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);