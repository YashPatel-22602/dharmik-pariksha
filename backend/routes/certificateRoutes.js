const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  downloadCertificate
} = require("../controllers/certificateController");

router.get(
  "/:year",
  authMiddleware,
  downloadCertificate
);

module.exports = router;