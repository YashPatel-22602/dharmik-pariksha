const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const TextToSVG = require("text-to-svg");

const User = require("../models/User");
const Result = require("../models/Result");


// ======================================================
// CERTIFICATE SIZE
// ======================================================
const CERTIFICATE_WIDTH = 1200;
const CERTIFICATE_HEIGHT = 1600;


// ======================================================
// ASSETS & FONTS
// ======================================================
const imagePath = path.join(
  __dirname,
  "../assets/certificate_template_new.png"
);

const fontPath = path.join(
  __dirname,
  "../assets/NotoSansGujarati-Bold.ttf"
);


// ======================================================
// CHECK FILES
// ======================================================
if (!fs.existsSync(imagePath)) {
  throw new Error(`Certificate template not found: ${imagePath}`);
}

if (!fs.existsSync(fontPath)) {
  throw new Error(`Noto Sans Gujarati font not found: ${fontPath}`);
}


// ======================================================
// LOAD ASSETS INTO RAM ONCE
// ======================================================
const TEMPLATE_BUFFER = fs.readFileSync(imagePath);
const textToSVG = TextToSVG.loadSync(fontPath);

console.log("========================================");
console.log("Certificate template loaded into RAM");
console.log(`Template size: ${(TEMPLATE_BUFFER.length / 1024 / 1024).toFixed(2)} MB`);
console.log("Vector Font Engine loaded into RAM");
console.log("========================================");


// ======================================================
// XML ESCAPE
// ======================================================
function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}


// ======================================================
// PDF COORDINATE → SVG COORDINATE
// ======================================================
function pdfToImagePosition(x, yFromBottom, elementWidth, elementHeight) {
  return {
    x,
    y: CERTIFICATE_HEIGHT - yFromBottom,
    width: elementWidth,
    height: elementHeight
  };
}


// ======================================================
// DETECT GUJARATI CHARACTERS
// ======================================================
function isGujarati(text) {
  // Unicode range for Gujarati characters
  return /[\u0A80-\u0AFF]/.test(String(text));
}


// ======================================================
// VECTOR TEXT GENERATOR (FOR GUJARATI)
// ======================================================
function generateTextPath(text, position, fontSize, fillColor) {
  return textToSVG.getPath(escapeXml(text), {
    x: position.x,
    y: position.y,
    fontSize: fontSize,
    anchor: 'left baseline',
    attributes: { fill: fillColor }
  });
}


// ======================================================
// CREATE CERTIFICATE SVG
// ======================================================
function createCertificateSvg({ name, year, examCenter, level, marks, lndId }) {

  const namePosition = pdfToImagePosition(290, 580, 400, 50);
  const yearPosition = pdfToImagePosition(835, 1320, 300, 110);
  const centerPosition = pdfToImagePosition(310, 480, 400, 55);
  const levelPosition = pdfToImagePosition(800, 480, 250, 55);
  const marksPosition = pdfToImagePosition(490, 380, 250, 55);
  const totalMarksPosition = pdfToImagePosition(910, 380, 200, 55);
  const lndIdPosition = pdfToImagePosition(290, 280, 400, 55);

  // Dynamically choose vector path (Gujarati) or standard text (English)
  const nameElement = isGujarati(name)
    ? generateTextPath(name, namePosition, 40, "black")
    : `<text x="${namePosition.x}" y="${namePosition.y}" font-size="40" class="certificate-text">${escapeXml(name)}</text>`;

  return `
<svg
  width="${CERTIFICATE_WIDTH}"
  height="${CERTIFICATE_HEIGHT}"
  viewBox="0 0 ${CERTIFICATE_WIDTH} ${CERTIFICATE_HEIGHT}"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <style>
      .certificate-text {
        font-family: sans-serif;
        font-weight: 700;
        fill: black;
      }
      .certificate-year {
        font-family: sans-serif;
        font-weight: 700;
        fill: rgb(245, 194, 46);
      }
    </style>
  </defs>

  <!-- Dynamic Name Element -->
  ${nameElement}

  <!-- All other fields use standard system fonts -->
  <text x="${yearPosition.x}" y="${yearPosition.y}" font-size="90" class="certificate-year">${escapeXml(year)}</text>
  <text x="${centerPosition.x}" y="${centerPosition.y}" font-size="40" class="certificate-text">${escapeXml(examCenter)}</text>
  <text x="${levelPosition.x}" y="${levelPosition.y}" font-size="40" class="certificate-text">${escapeXml(level)}</text>
  <text x="${marksPosition.x}" y="${marksPosition.y}" font-size="40" class="certificate-text">${escapeXml(marks)}</text>
  <text x="${totalMarksPosition.x}" y="${totalMarksPosition.y}" font-size="40" class="certificate-text">100</text>
  <text x="${lndIdPosition.x}" y="${lndIdPosition.y}" font-size="40" class="certificate-text">${escapeXml(lndId)}</text>
</svg>
`;
}


// ======================================================
// CERTIFICATE CONCURRENCY LIMIT
// ======================================================
const MAX_CONCURRENT_CERTIFICATES = 3;
let activeCertificates = 0;
const certificateQueue = [];


function acquireCertificateSlot() {
  return new Promise((resolve) => {
    if (activeCertificates < MAX_CONCURRENT_CERTIFICATES) {
      activeCertificates++;
      resolve();
      return;
    }
    certificateQueue.push(resolve);
  });
}


function releaseCertificateSlot() {
  activeCertificates--;
  if (activeCertificates < 0) {
    activeCertificates = 0;
  }

  const next = certificateQueue.shift();
  if (next) {
    activeCertificates++;
    next();
  }
}


// ======================================================
// DOWNLOAD CERTIFICATE
// ======================================================
exports.downloadCertificate = async (req, res) => {
  await acquireCertificateSlot();

  try {
    const year = Number(req.params.year);

    if (!Number.isInteger(year)) {
      return res.status(400).json({ message: "Invalid exam year" });
    }

    const result = await Result.findOne({
      lndId: req.user.lndId,
      examYear: year
    }).lean();

    if (!result) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    const user = await User.findOne(
      { lndId: result.lndId },
      { examCenter: 1 }
    ).lean();

    const name = result.name || "";
    const examYear = String(result.examYear || "");
    const examCenter = user?.examCenter || "";
    const displayLevel = result.examLevel === "Basic" ? "Basic" : String(result.examLevel || "");
    const marks = String(result.marks ?? "");
    const lndId = result.lndId || "";

    console.log("========================================");
    console.log("CERTIFICATE DATA:");
    console.log({ name, examYear, examCenter, displayLevel, marks, lndId });
    console.log("========================================");

    const svg = createCertificateSvg({
      name,
      year: examYear,
      examCenter,
      level: displayLevel,
      marks,
      lndId
    });

    const svgBuffer = Buffer.from(svg);

    const certificate = await sharp(TEMPLATE_BUFFER)
      .resize(CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT) 
      .composite([
        {
          input: svgBuffer,
          left: 0,
          top: 0
        }
      ])
      .png({
        compressionLevel: 6,
        adaptiveFiltering: true
      })
      .toBuffer();

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Certificate-${year}.png"`
    );
    res.setHeader("Content-Length", certificate.length);

    console.log(
      "Certificate generated:",
      req.user.lndId,
      "|",
      `Year: ${year}`,
      "|",
      `${(certificate.length / 1024).toFixed(1)} KB`
    );

    return res.send(certificate);

  } catch (err) {
    console.error("========================================");
    console.error("CERTIFICATE GENERATION FAILED");
    console.error("MESSAGE:", err.message);
    console.error("STACK:", err.stack);
    console.error("========================================");

    return res.status(500).json({
      message: "Certificate generation failed",
      error: err.message
    });

  } finally {
    releaseCertificateSlot();
  }
};