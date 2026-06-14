const Counter = require("../models/Counter");
const User = require("../models/User");

const generateLndId = async (centerCode) => {

  let counter = await Counter.findOne({ centerCode });

  if (!counter) {

    const lastUser = await User.findOne({
      examCenterCode: centerCode
    }).sort({ lndId: -1 });

    let lastNumber = 0;

    if (lastUser?.lndId) {

      const match = lastUser.lndId.match(
        new RegExp(`^LNDID${centerCode}(\\d+)$`)
      );

      if (match) {
        lastNumber = parseInt(match[1], 10);
      }
    }

    counter = await Counter.create({
      centerCode,
      lastNumber
    });
  }

  counter.lastNumber += 1;

  await counter.save();

  const numberPart = String(counter.lastNumber).padStart(5, "0");

  return `LNDID${centerCode}${numberPart}`;
};

module.exports = generateLndId;