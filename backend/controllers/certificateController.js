const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const User = require("../models/User");
const Result = require("../models/Result");


// ======================================================
// CERTIFICATE SIZE
// ======================================================

const CERTIFICATE_WIDTH = 1200;
const CERTIFICATE_HEIGHT = 1600;


// ======================================================
// CERTIFICATE TEMPLATE
// ======================================================

const imagePath = path.join(
  __dirname,
  "../assets/certificate_template_new.png"
);


// ======================================================
// NOTO SANS GUJARATI FONT
// ======================================================

const notoGujaratiFontPath = path.join(
  __dirname,
  "../node_modules/@fontsource/noto-sans-gujarati/files/noto-sans-gujarati-gujarati-700-normal.woff"
);


// ======================================================
// CHECK FILES
// ======================================================

if (!fs.existsSync(imagePath)) {
  throw new Error(
    `Certificate template not found: ${imagePath}`
  );
}

if (!fs.existsSync(notoGujaratiFontPath)) {
  throw new Error(
    `Noto Sans Gujarati font not found: ${notoGujaratiFontPath}`
  );
}


// ======================================================
// LOAD TEMPLATE ONCE
// ======================================================

const TEMPLATE_BUFFER =
  fs.readFileSync(imagePath);

console.log(
  "========================================"
);

console.log(
  "Certificate template loaded into RAM"
);

console.log(
  `Template size: ${(TEMPLATE_BUFFER.length / 1024 / 1024).toFixed(2)} MB`
);


// ======================================================
// LOAD NOTO GUJARATI FONT ONCE
// ======================================================

const NOTO_GUJARATI_FONT_BUFFER =
  fs.readFileSync(
    notoGujaratiFontPath
  );

const NOTO_GUJARATI_FONT_BASE64 =
  NOTO_GUJARATI_FONT_BUFFER.toString(
    "base64"
  );

console.log(
  "Noto Sans Gujarati 700 loaded into RAM"
);

console.log(
  `Font size: ${(NOTO_GUJARATI_FONT_BUFFER.length / 1024).toFixed(1)} KB`
);

console.log(
  "========================================"
);


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
//
// OLD PDF:
// Origin = bottom-left
//
// SVG / PNG:
// Origin = top-left
//
// IMPORTANT:
//
// pdf-lib drawText() uses the supplied Y coordinate
// as the text baseline.
//
// Therefore we ONLY flip the Y axis.
//
// PDF:
//     Y = 1320
//
// SVG:
//     Y = 1600 - 1320
//     Y = 280
//
// DO NOT subtract elementHeight.
//
// DO NOT add +40 or +90 later.
//
// X remains exactly the same.
//
// ======================================================

function pdfToImagePosition(
  x,
  yFromBottom,
  elementWidth,
  elementHeight
) {

  return {

    x,

    // Convert PDF-style bottom coordinate
    // to SVG top coordinate.
    //
    // SVG text uses BASELINE.
    //
    // So:
    // bottom Y = 580
    // top SVG Y = 1600 - 580
    //
    y: CERTIFICATE_HEIGHT - yFromBottom,

    width: elementWidth,

    height: elementHeight

  };

}



// ======================================================
// CREATE CERTIFICATE SVG
// ======================================================

function createCertificateSvg({

  name,
  year,
  examCenter,
  level,
  marks,
  lndId

}) {


  // ====================================================
  // NAME
  // ====================================================
  //
  // Original PDF:
  //
  // X = 290
  // Y = 580
  // Width = 400
  // Height = 50
  // Font size = 40
  //
  // SVG:
  //
  // X = 290
  // Y = 1600 - 580
  // Y = 1020
  //
  // ====================================================

  const namePosition =
    pdfToImagePosition(
      290,
      580,
      400,
      50
    );


  // ====================================================
  // YEAR
  // ====================================================
  //
  // Original PDF:
  //
  // X = 835
  // Y = 1320
  // Width = 300
  // Height = 110
  // Font size = 90
  //
  // SVG:
  //
  // X = 835
  // Y = 1600 - 1320
  // Y = 280
  //
  // ====================================================

  const yearPosition =
    pdfToImagePosition(
      835,
      1320,
      300,
      110
    );


  // ====================================================
  // EXAM CENTER
  // ====================================================
  //
  // Original PDF:
  //
  // X = 310
  // Y = 480
  // Width = 400
  // Height = 55
  // Font size = 40
  //
  // SVG:
  //
  // X = 310
  // Y = 1600 - 480
  // Y = 1120
  //
  // ====================================================

  const centerPosition =
    pdfToImagePosition(
      310,
      480,
      400,
      55
    );


  // ====================================================
  // LEVEL
  // ====================================================
  //
  // Original PDF:
  //
  // X = 800
  // Y = 480
  // Width = 250
  // Height = 55
  // Font size = 40
  //
  // SVG:
  //
  // X = 800
  // Y = 1120
  //
  // ====================================================

  const levelPosition =
    pdfToImagePosition(
      800,
      480,
      250,
      55
    );


  // ====================================================
  // MARKS
  // ====================================================
  //
  // Original PDF:
  //
  // X = 490
  // Y = 380
  // Width = 250
  // Height = 55
  // Font size = 40
  //
  // SVG:
  //
  // X = 490
  // Y = 1600 - 380
  // Y = 1220
  //
  // ====================================================

  const marksPosition =
    pdfToImagePosition(
      490,
      380,
      250,
      55
    );


  // ====================================================
  // TOTAL MARKS
  // ====================================================
  //
  // Original PDF:
  //
  // X = 910
  // Y = 380
  // Width = 200
  // Height = 55
  // Font size = 40
  //
  // SVG:
  //
  // X = 910
  // Y = 1220
  //
  // ====================================================

  const totalMarksPosition =
    pdfToImagePosition(
      910,
      380,
      200,
      55
    );


  // ====================================================
  // LND ID
  // ====================================================
  //
  // Original PDF:
  //
  // X = 290
  // Y = 280
  // Width = 400
  // Height = 55
  // Font size = 40
  //
  // SVG:
  //
  // X = 290
  // Y = 1600 - 280
  // Y = 1320
  //
  // ====================================================

  const lndIdPosition =
    pdfToImagePosition(
      290,
      280,
      400,
      55
    );


  // ====================================================
  // CREATE SVG
  // ====================================================

  return `
<svg
  width="${CERTIFICATE_WIDTH}"
  height="${CERTIFICATE_HEIGHT}"
  viewBox="0 0 ${CERTIFICATE_WIDTH} ${CERTIFICATE_HEIGHT}"
  xmlns="http://www.w3.org/2000/svg"
>

  <defs>

    <style>

      @font-face {

        font-family: "Noto Sans Gujarati";

        src: url(
          "data:font/woff;base64,${NOTO_GUJARATI_FONT_BASE64}"
        )
        format("woff");

        font-weight: 700;

        font-style: normal;

      }


      .certificate-text {

        font-family:
          "Noto Sans Gujarati",
          sans-serif;

        font-weight: 700;

        fill: black;

      }


      .certificate-year {

        font-family:
          "Noto Sans Gujarati",
          sans-serif;

        font-weight: 700;

        fill: rgb(245, 194, 46);

      }

    </style>

  </defs>


  <!-- ================================================= -->
  <!-- NAME                                               -->
  <!-- ================================================= -->

  <text
    x="${namePosition.x}"
    y="${namePosition.y}"
    font-size="40"
    class="certificate-text"
  >${escapeXml(name)}</text>


  <!-- ================================================= -->
  <!-- YEAR                                               -->
  <!-- ================================================= -->

  <text
    x="${yearPosition.x}"
    y="${yearPosition.y}"
    font-size="90"
    class="certificate-year"
  >${escapeXml(year)}</text>


  <!-- ================================================= -->
  <!-- EXAM CENTER                                       -->
  <!-- ================================================= -->

  <text
    x="${centerPosition.x}"
    y="${centerPosition.y}"
    font-size="40"
    class="certificate-text"
  >${escapeXml(examCenter)}</text>


  <!-- ================================================= -->
  <!-- LEVEL                                              -->
  <!-- ================================================= -->

  <text
    x="${levelPosition.x}"
    y="${levelPosition.y}"
    font-size="40"
    class="certificate-text"
  >${escapeXml(level)}</text>


  <!-- ================================================= -->
  <!-- MARKS                                              -->
  <!-- ================================================= -->

  <text
    x="${marksPosition.x}"
    y="${marksPosition.y}"
    font-size="40"
    class="certificate-text"
  >${escapeXml(marks)}</text>


  <!-- ================================================= -->
  <!-- TOTAL MARKS                                       -->
  <!-- ================================================= -->

  <text
    x="${totalMarksPosition.x}"
    y="${totalMarksPosition.y}"
    font-size="40"
    class="certificate-text"
  >100</text>


  <!-- ================================================= -->
  <!-- LND ID                                             -->
  <!-- ================================================= -->

  <text
    x="${lndIdPosition.x}"
    y="${lndIdPosition.y}"
    font-size="40"
    class="certificate-text"
  >${escapeXml(lndId)}</text>


</svg>
`;

}


// ======================================================
// CERTIFICATE CONCURRENCY LIMIT
// ======================================================
//
// Maximum 3 certificates generated at the same time.
//
// This helps prevent Render memory spikes.
//

const MAX_CONCURRENT_CERTIFICATES = 3;

let activeCertificates = 0;

const certificateQueue = [];


// ======================================================
// ACQUIRE CERTIFICATE SLOT
// ======================================================

function acquireCertificateSlot() {

  return new Promise((resolve) => {

    if (
      activeCertificates <
      MAX_CONCURRENT_CERTIFICATES
    ) {

      activeCertificates++;

      resolve();

      return;

    }


    certificateQueue.push(
      resolve
    );

  });

}


// ======================================================
// RELEASE CERTIFICATE SLOT
// ======================================================

function releaseCertificateSlot() {

  activeCertificates--;

  if (
    activeCertificates < 0
  ) {

    activeCertificates = 0;

  }


  const next =
    certificateQueue.shift();


  if (next) {

    activeCertificates++;

    next();

  }

}


// ======================================================
// DOWNLOAD CERTIFICATE
// ======================================================

exports.downloadCertificate = async (
  req,
  res
) => {


  // ====================================================
  // LIMIT SIMULTANEOUS GENERATION
  // ====================================================

  await acquireCertificateSlot();


  try {


    // ==================================================
    // YEAR
    // ==================================================

    const year =
      Number(
        req.params.year
      );


    if (
      !Number.isInteger(year)
    ) {

      return res.status(400).json({

        message:
          "Invalid exam year"

      });

    }


    // ==================================================
    // GET RESULT
    // ==================================================

    const result =
      await Result.findOne({

        lndId:
          req.user.lndId,

        examYear:
          year

      }).lean();


    // ==================================================
    // CHECK RESULT
    // ==================================================

    if (!result) {

      return res.status(404).json({

        message:
          "Certificate not found"

      });

    }


    // ==================================================
    // GET USER
    // ==================================================

    const user =
      await User.findOne(

        {
          lndId:
            result.lndId
        },

        {
          examCenter:
            1
        }

      ).lean();


    // ==================================================
    // PREPARE CERTIFICATE DATA
    // ==================================================

    const name =
      result.name || "";


    const examYear =
      String(
        result.examYear || ""
      );


    const examCenter =
      user?.examCenter || "";


    const displayLevel =
      result.examLevel === "Basic"

        ? "Basic"

        : String(
            result.examLevel || ""
          );


    const marks =
      String(
        result.marks ?? ""
      );


    const lndId =
      result.lndId || "";


    // ==================================================
    // DEBUG DATA
    // ==================================================

    console.log(
      "========================================"
    );

    console.log(
      "CERTIFICATE DATA:"
    );

    console.log({

      name,

      examYear,

      examCenter,

      displayLevel,

      marks,

      lndId

    });

    console.log(
      "========================================"
    );


    // ==================================================
    // CREATE SVG
    // ==================================================

    const svg =
      createCertificateSvg({

        name,

        year:
          examYear,

        examCenter,

        level:
          displayLevel,

        marks,

        lndId

      });


    const svgBuffer =
      Buffer.from(svg);


    // ==================================================
    // GENERATE CERTIFICATE PNG
    // ==================================================

    const certificate =
      await sharp(
        TEMPLATE_BUFFER
      )
      .resize(CERTIFICATE_WIDTH, CERTIFICATE_HEIGHT) // <-- ADD THIS LINE
      .composite([

        {

          input:
            svgBuffer,

          left:
            0,

          top:
            0

        }

      ])
      .png({

        compressionLevel:
          6,

        adaptiveFiltering:
          true

      })
      .toBuffer();


    // ==================================================
    // RESPONSE HEADERS
    // ==================================================

    res.setHeader(
      "Content-Type",
      "image/png"
    );


    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Certificate-${year}.png"`
    );


    res.setHeader(
      "Content-Length",
      certificate.length
    );


    // ==================================================
    // LOG
    // ==================================================

    console.log(

      "Certificate generated:",

      req.user.lndId,

      "|",

      `Year: ${year}`,

      "|",

      `${(certificate.length / 1024).toFixed(1)} KB`

    );


    // ==================================================
    // SEND PNG
    // ==================================================

    return res.send(
      certificate
    );


  } catch (err) {


    // ==================================================
    // ERROR LOG
    // ==================================================

    console.error(
      "========================================"
    );

    console.error(
      "CERTIFICATE GENERATION FAILED"
    );

    console.error(
      "MESSAGE:",
      err.message
    );

    console.error(
      "STACK:",
      err.stack
    );

    console.error(
      "========================================"
    );


    return res.status(500).json({

      message:
        "Certificate generation failed",

      error:
        err.message

    });


  } finally {


    // ==================================================
    // ALWAYS RELEASE SLOT
    // ==================================================

    releaseCertificateSlot();

  }

};

