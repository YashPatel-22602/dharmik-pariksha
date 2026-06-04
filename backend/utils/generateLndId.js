const Counter = require("../models/Counter");

const generateLndId = async (centerCode) => {
  const counter = await Counter.findOneAndUpdate(
    { centerCode },
    { $inc: { lastNumber: 1 } },
    { new: true, upsert: true }
  );

  const numberPart = String(counter.lastNumber).padStart(5, "0");

  return `LNDID${centerCode}${numberPart}`;
};

module.exports = generateLndId;
