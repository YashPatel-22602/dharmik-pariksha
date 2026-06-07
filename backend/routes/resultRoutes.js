const express = require("express");
const router = express.Router();

const Result = require("../models/Result");
const { getMyResults } = require("../controllers/resultController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/my", authMiddleware, getMyResults);

router.get(
  "/certificate-years",
  authMiddleware,
  async (req,res)=>{

    try{

      const results = await Result.find(
        {
          lndId:req.user.lndId
        }
      )
      .select("examYear examLevel")
      .sort({examYear:-1});

      res.json(results);

    }catch(err){

      res.status(500).json({
        message:"Server Error"
      });

    }

});

module.exports = router;