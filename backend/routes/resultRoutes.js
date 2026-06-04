const express = require("express");
const router = express.Router();

const { getMyResults } = require("../controllers/resultController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/my", authMiddleware, getMyResults);

module.exports = router;