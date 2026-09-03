const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const {
  PDFDocument,
  StandardFonts,
  rgb
} = require("pdf-lib");

const User = require("../models/User");
const Result = require("../models/Result");
const Registration = require("../models/Registration");

const imagePath = path.join(
  __dirname,
  "../assets/certificate_template_new.png"
);

const TEMPLATE_BYTES = fs.readFileSync(imagePath);


// ======================================================
// RENDER NAME AS PNG
// ======================================================

async function createNameImage(name) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1000,
      height: 150,
      deviceScaleFactor: 2
    });

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">

          <style>
            html,
            body {
              margin: 0;
              padding: 0;
              background: transparent;
            }

            .name {
              display: inline-block;
              white-space: nowrap;
              font-family: Arial, sans-serif;
              font-size: 40px;
              font-weight: bold;
              color: black;
            }
          </style>
        </head>

        <body>
          <div class="name">${escapeHtml(name)}</div>
        </body>
      </html>
    `);

    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const element = await page.$(".name");

    if (!element) {
      throw new Error("Name element was not created");
    }

    const image = await element.screenshot({
      type: "png",
      omitBackground: true
    });

    return image;

  } finally {
    await browser.close();
  }
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ======================================================
// DOWNLOAD CERTIFICATE
// ======================================================

exports.downloadCertificate = async (req, res) => {
  try {

    const year = Number(req.params.year);


    // ==================================================
    // FETCH RESULT
    // ==================================================

    const result = await Result.findOne({
      lndId: req.user.lndId,
      examYear: year
    }).lean();


    if (!result) {
      return res.status(404).json({
        message: "Certificate not found"
      });
    }


    // ==================================================
    // FETCH USER
    // ==================================================

    const user = await User.findOne(
      {
        lndId: result.lndId
      },
      {
        examCenter: 1
      }
    ).lean();


    // ==================================================
    // LOAD TEMPLATE
    // ==================================================

    const imageBytes = TEMPLATE_BYTES;

    const pdfDoc = await PDFDocument.create();

    const page = pdfDoc.addPage([
      1200,
      1600
    ]);


    // ==================================================
    // ADD CERTIFICATE TEMPLATE
    // ==================================================

    const pngImage = await pdfDoc.embedPng(
      imageBytes
    );

    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: 1200,
      height: 1600
    });


    // ==================================================
    // STANDARD FONT
    // ==================================================

    const font = await pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );


    // ==================================================
    // FORMAT LEVEL
    // ==================================================

    const displayLevel =
      result.examLevel === "Basic"
        ? "Basic"
        : ` ${result.examLevel}`;


    // ==================================================
    // NAME
    // ==================================================

    // IMPORTANT:
    // Gujarati/Unicode name is rendered by Chromium,
    // NOT by pdf-lib.

    const nameImageBytes = await createNameImage(
      result.name || ""
    );

    const nameImage = await pdfDoc.embedPng(
      nameImageBytes
    );

    page.drawImage(nameImage, {
      x: 290,
      y: 580,
      width: 400,
      height: 50
    });


    // ==================================================
    // YEAR
    // ==================================================

    page.drawText(
      String(result.examYear),
      {
        x: 835,
        y: 1320,
        size: 90,
        font,
        color: rgb(
          0.96,
          0.76,
          0.18
        )
      }
    );


    // ==================================================
    // EXAM CENTER
    // ==================================================

    page.drawText(
      user?.examCenter || "",
      {
        x: 310,
        y: 480,
        size: 40,
        font
      }
    );


    // ==================================================
    // LEVEL
    // ==================================================

    page.drawText(
      displayLevel,
      {
        x: 800,
        y: 480,
        size: 40,
        font
      }
    );


    // ==================================================
    // MARKS OBTAINED
    // ==================================================

    page.drawText(
      String(result.marks || ""),
      {
        x: 490,
        y: 380,
        size: 40,
        font
      }
    );


    // ==================================================
    // TOTAL MARKS
    // ==================================================

    page.drawText(
      "100",
      {
        x: 910,
        y: 380,
        size: 40,
        font
      }
    );


    // ==================================================
    // LND ID
    // ==================================================

    page.drawText(
      result.lndId || "",
      {
        x: 290,
        y: 280,
        size: 40,
        font
      }
    );


    // ==================================================
    // SAVE PDF
    // ==================================================

    const pdfBytes = await pdfDoc.save();


    // ==================================================
    // RESPONSE
    // ==================================================

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
  console.error("=================================");
  console.error("CERTIFICATE GENERATION FAILED");
  console.error("MESSAGE:", err.message);
  console.error("STACK:", err.stack);
  console.error("=================================");

  return res.status(500).json({
    message: "Certificate generation failed",
    error: err.message
  });
}
};