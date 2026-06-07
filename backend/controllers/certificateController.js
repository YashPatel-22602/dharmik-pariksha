const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts,rgb } = require("pdf-lib");
const User = require("../models/User");
const Result = require("../models/Result");
const Registration = require("../models/Registration");

exports.downloadCertificate = async (req, res) => {
  try {
    const year = Number(req.params.year);

    // ==========================
    // FETCH RESULT
    // ==========================

    const result = await Result.findOne({
      lndId: req.user.lndId,
      examYear: year
    });

    const user = await User.findOne({
    lndId: result.lndId
    });


    if (!result) {
      return res.status(404).json({
        message: "Certificate not found"
      });
    }

    // ==========================
    // FETCH REGISTRATION
    // ==========================


    // ==========================
    // LOAD TEMPLATE
    // ==========================

    const imagePath = path.join(
      __dirname,
      "../assets/certificate-template.png"
    );

    const imageBytes = fs.readFileSync(imagePath);

    const pdfDoc = await PDFDocument.create();

    const page = pdfDoc.addPage([1200, 1600]);

    const pngImage = await pdfDoc.embedPng(imageBytes);

    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: 1200,
      height: 1600
    });

    const font = await pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );

    // ==========================
    // FORMAT LEVEL
    // ==========================

    const displayLevel =
      result.examLevel === "Basic"
        ? "Basic"
        : `Level ${result.examLevel}`;

    // ==========================
    // NAME
    // ==========================

    page.drawText(result.name || "", {
      x: 260,
      y: 585,
      size: 34,
      font
    });

    // ==========================
    // YEAR
    // ==========================

    page.drawText(
      String(result.examYear),
      {
        x: 915,
        y: 1290,
        size: 70,
        color: rgb(1, 1, 0), // Yellow
        font
      }
    );

    // ==========================
    // EXAM CENTER
    // ==========================

    page.drawText(
      user?.examCenter || "",
      {
        x: 240,
        y: 490,
        size: 40,
        font
      }
    );

    // ==========================
    // LEVEL
    // ==========================

    page.drawText(
      displayLevel,
      {
        x: 800,
        y: 490,
        size: 35,
        font
      }
    );

    // ==========================
    // MARKS OBTAINED
    // ==========================

    page.drawText(
      String(result.marks || ""),
      {
        x: 415,
        y: 400,
        size: 35,
        font
      }
    );

    // ==========================
    // TOTAL MARKS
    // ==========================

    page.drawText(
      "100",
      {
        x: 850,
        y: 400,
        size: 35,
        font
      }
    );

    // ==========================
    // LND ID
    // ==========================

    page.drawText(
      result.lndId || "",
      {
        x: 260,
        y: 315,
        size: 40,
        font
      }
    );

    // ==========================
    // SAVE PDF
    // ==========================

    const pdfBytes = await pdfDoc.save();

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Certificate-${year}.pdf`
    );

    return res.send(
      Buffer.from(pdfBytes)
    );

  } catch (err) {

    console.error(
      "CERTIFICATE ERROR:",
      err
    );

    return res.status(500).json({
      message: "Certificate generation failed"
    });

  }
};