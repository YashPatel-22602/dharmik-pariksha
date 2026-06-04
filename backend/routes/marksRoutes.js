const express = require("express");
const router = express.Router();
const multer = require("multer");

const {uploadMarks} = require("../controllers/marksController");

const upload = multer({dest:"uploads/"});

router.post("/upload-marks",upload.single("file"),uploadMarks);

module.exports = router;