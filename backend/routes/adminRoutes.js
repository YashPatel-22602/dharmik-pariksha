const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const { uploadLegacyUsers, uploadMarks } = require("../controllers/adminController");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/upload-legacy-users", upload.single("file"), uploadLegacyUsers);
router.post("/upload-marks", upload.single("file"), uploadMarks);

const { downloadUsersByCenter } = require("../controllers/adminController");

router.get("/download-users-by-center", downloadUsersByCenter);

const { downloadUserRegForExam } = require("../controllers/adminController");

router.get("/download-users-reg-for-exam", downloadUserRegForExam);

const {
  toggleRegistration,
  getRegistrationStatus
} = require("../controllers/adminController");
router.post("/toggle-registration", adminMiddleware, toggleRegistration);
router.post("/toggle-registration", toggleRegistration);
router.get("/registration-status", getRegistrationStatus);

module.exports = router;

module.exports = router;