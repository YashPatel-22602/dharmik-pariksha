const Registration = require("../models/Registration");

// GET STATUS
exports.getRegistrationStatus = async (req, res) => {
  try {
    let reg = await Registration.findOne();

    // If not exists → create default
    if (!reg) {
      reg = await Registration.create({ isOpen: false });
    }

    res.json(reg);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// TOGGLE (ADMIN)
exports.toggleRegistration = async (req, res) => {
  try {
    let reg = await Registration.findOne();

    if (!reg) {
      reg = await Registration.create({ isOpen: true });
    } else {
      reg.isOpen = !reg.isOpen;
      await reg.save();
    }

    res.json({
      message: `Registration ${reg.isOpen ? "Opened" : "Closed"}`,
      isOpen: reg.isOpen
    });

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};