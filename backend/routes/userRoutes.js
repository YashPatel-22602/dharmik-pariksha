const express = require("express");
const router = express.Router();

// ✅ CORRECT IMPORT
const protect = require("../middleware/authMiddleware");

// Protected route
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "This is a protected route",
    user: req.user
  });
}); 

const { registerForExam } = require("../controllers/userController");

router.post("/register-exam", registerForExam);

module.exports = router;

module.exports = router;