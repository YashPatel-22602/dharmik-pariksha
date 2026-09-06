const archiver = require("archiver"); // Add to the top imports
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const User = require("../models/User");
const Result = require("../models/Result");

// ======================================================
// CERTIFICATE SIZE & ASSETS
// ======================================================
const CERTIFICATE_WIDTH = 1200;
const CERTIFICATE_HEIGHT = 1600;

const imagePath = path.join(__dirname, "../assets/certificate_template_new.png");

if (!fs.existsSync(imagePath)) {
  throw new Error(`Certificate template not found: ${imagePath}`);
}

const TEMPLATE_BUFFER = fs.readFileSync(imagePath);

console.log("========================================");
console.log("Certificate template loaded into RAM");
console.log(`Template size: ${(TEMPLATE_BUFFER.length / 1024 / 1024).toFixed(2)} MB`);
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

function pdfToImagePosition(x, yFromBottom, elementWidth, elementHeight) {
  return {
    x,
    y: CERTIFICATE_HEIGHT - yFromBottom,
    width: elementWidth,
    height: elementHeight
  };
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

  return `
<svg width="${CERTIFICATE_WIDTH}" height="${CERTIFICATE_HEIGHT}" viewBox="0 0 ${CERTIFICATE_WIDTH} ${CERTIFICATE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .certificate-text {
        font-family: "Noto Sans Gujarati", sans-serif;
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

  <text x="${namePosition.x}" y="${namePosition.y}" font-size="40" class="certificate-text">${escapeXml(name)}</text>
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
// CONCURRENCY LIMIT
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
  if (activeCertificates < 0) activeCertificates = 0;
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
    if (!Number.isInteger(year)) return res.status(400).json({ message: "Invalid exam year" });

    const result = await Result.findOne({ lndId: req.user.lndId, examYear: year }).lean();
    if (!result) return res.status(404).json({ message: "Certificate not found" });

    const user = await User.findOne({ lndId: result.lndId }, { examCenter: 1 }).lean();

    const svg = createCertificateSvg({
      name: result.name || "",
      year: String(result.examYear || ""),
      examCenter: user?.examCenter || "",
      level: result.examLevel === "Basic" ? "Basic" : String(result.examLevel || ""),
      marks: String(result.marks ?? ""),
      lndId: result.lndId || ""
    });

    const certificate = await sharp(TEMPLATE_BUFFER)
      .resize(CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT) 
      .composite([{ input: Buffer.from(svg), left: 0, top: 0 }])
      .png({ compressionLevel: 6, adaptiveFiltering: true })
      .toBuffer();

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename="Certificate-${year}.png"`);
    res.setHeader("Content-Length", certificate.length);

    console.log(`Certificate generated: ${result.lndId} | ${(certificate.length / 1024).toFixed(1)} KB`);
    return res.send(certificate);

  } catch (err) {
    console.error("CERTIFICATE GENERATION FAILED:", err.message);
    return res.status(500).json({ message: "Certificate generation failed", error: err.message });
  } finally {
    releaseCertificateSlot();
  }
};


exports.downloadCenterCertificates = async (req, res) => {
  try {
    const year = Number(req.params.year);
    const centerName = req.params.center;

    if (!Number.isInteger(year) || !centerName) {
      return res.status(400).json({ message: "Invalid year or center" });
    }

    const usersInCenter = await User.find({ examCenter: centerName }).lean();
    if (!usersInCenter.length) return res.status(404).json({ message: "No users found" });

    const lndIds = usersInCenter.map(u => u.lndId);
    const results = await Result.find({ lndId: { $in: lndIds }, examYear: year }).lean();
    if (!results.length) return res.status(404).json({ message: "No results found" });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${centerName}-Certificates-${year}.zip"`);

    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.pipe(res);

    for (const result of results) {
      await acquireCertificateSlot(); 
      try {
        const user = usersInCenter.find(u => u.lndId === result.lndId);
        const svg = createCertificateSvg({
          name: result.name || "",
          year: String(result.examYear || ""),
          examCenter: user.examCenter || "",
          level: result.examLevel === "Basic" ? "Basic" : String(result.examLevel || ""),
          marks: String(result.marks ?? ""),
          lndId: result.lndId || ""
        });

        const certificateBuffer = await sharp(TEMPLATE_BUFFER)
          .resize(CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT)
          .composite([{ input: Buffer.from(svg), left: 0, top: 0 }])
          .png({ compressionLevel: 6, adaptiveFiltering: true })
          .toBuffer();

        const safeName = (result.name || result.lndId).replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, "_");
        archive.append(certificateBuffer, { name: `${result.lndId}_${safeName}.png` });
      } finally {
        releaseCertificateSlot(); 
      }
    }
    await archive.finalize();
  } catch (err) {
    console.error("BULK GEN FAILED:", err.message);
    if (!res.headersSent) res.status(500).json({ message: "Failed", error: err.message });
  }
};

// ======================================================
// BULK DOWNLOAD ALL CENTERS (MASTER ZIP)
// ======================================================
exports.downloadAllCertificates = async (req, res) => {
  try {
    const year = Number(req.params.year);

    if (!Number.isInteger(year)) {
      return res.status(400).json({ message: "Invalid exam year" });
    }

    // 1. Get ALL results for this year
    const results = await Result.find({ examYear: year }).lean();
    if (!results.length) {
      return res.status(404).json({ message: "No results found for this year" });
    }

    // 2. Get ALL corresponding users to find their centers
    const lndIds = results.map(r => r.lndId);
    const users = await User.find({ lndId: { $in: lndIds } }).lean();

    // Map users for instant lookup
    const userMap = {};
    users.forEach(u => { userMap[u.lndId] = u; });

    // 3. Set up the ZIP stream headers
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition", 
      `attachment; filename="All-Centers-Certificates-${year}.zip"`
    );

    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.pipe(res);

    // 4. Generate certificates sequentially and organize into folders
    for (const result of results) {
      await acquireCertificateSlot(); // Prevent memory crash

      try {
        const user = userMap[result.lndId] || {};
        const centerName = user.examCenter || "Unknown_Center";
        
        const svg = createCertificateSvg({
          name: result.name || "",
          year: String(result.examYear || ""),
          examCenter: centerName,
          level: result.examLevel === "Basic" ? "Basic" : String(result.examLevel || ""),
          marks: String(result.marks ?? ""),
          lndId: result.lndId || ""
        });

        const certificateBuffer = await sharp(TEMPLATE_BUFFER)
          .resize(CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT)
          .composite([{ input: Buffer.from(svg), left: 0, top: 0 }])
          .png({ compressionLevel: 6, adaptiveFiltering: true })
          .toBuffer();

        // Create safe folder and file names
        const safeName = (result.name || result.lndId).replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, "_");
        const safeCenter = centerName.replace(/[^a-zA-Z0-9\s]/g, "_");
        
        // Append to ZIP inside a center-specific subfolder
        archive.append(certificateBuffer, { name: `${safeCenter}/${result.lndId}_${safeName}.png` });

      } finally {
        releaseCertificateSlot();
      }
    }

    // 5. Finalize the ZIP
    await archive.finalize();
    console.log(`Successfully zipped ${results.length} certificates across all centers.`);

  } catch (err) {
    console.error("MASTER ZIP FAILED:", err.message);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Master ZIP generation failed", error: err.message });
    }
  }
};