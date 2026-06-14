const mongoose = require("mongoose");
const User = require("./models/User");
const express = require("express");
const cors = require("cors");

async function createAdmin() {
  try {

    require("dotenv").config();

    const connectDB = require("./config/db");

    const app = express();

    // Connect DB FIRST
    connectDB();
    console.log("✅ MongoDB Connected");

    const admin = new User({
      lndId: "JITU@1008",
      name: "Super Admin",
      age: 30,
      gender: "Male",
      mobileNumber: "7788777881",
      examCenter: "HQ",
      role: "admin",
      password: "LaljiShree1008"
    });

    await admin.save();

    console.log("✅ Admin Created Successfully");

    mongoose.connection.close();

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

createAdmin();