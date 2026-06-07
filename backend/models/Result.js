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
type: String,
required: true
},

examYear: {
type: Number,
required: true
},

marks: {
type: String,
required: true
},

submittedAt: {
type: Date,
required: true
}
},
{ timestamps: true }
);

resultSchema.index(
 {
   lndId: 1,
   examYear: 1
 },
 {
   unique: true
 }
);

module.exports = mongoose.model("Result", resultSchema);