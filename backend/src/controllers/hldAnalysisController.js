const pdfParse = require("pdf-parse");
const { analyzeArchitecture, generateImprovedArchitecture } = require("../engine/improveEngine");

const MIN_PDF_TEXT_LENGTH  = 100;

async function analyzeHLDFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No HLD file provided." });
    }

    const buffer = req.file.buffer;
    const mime   = req.file.mimetype || "";
    const userDescription = (req.body.existingHLD || "").trim();
    let extractedText = "";

    if (mime === "application/pdf") {
      // Extract real text from PDF
      const data = await pdfParse(buffer);
      extractedText = (data.text || "").trim();

      if (extractedText.length < MIN_PDF_TEXT_LENGTH) {
        return res.status(422).json({
          status: "error",
          message: `This PDF appears to be empty or image-only (${extractedText.length} chars extracted). ` +
            "Please export a text-based PDF, or paste your HLD description in the text field below."
        });
      }

    } else {
      return res.status(400).json({
        status: "error",
        message: "Image uploads are no longer supported. Please upload a text-based PDF (.pdf) or describe your architecture in the text box below."
      });
    }

    const improvementsWanted = (req.body.improvementsWanted || "").trim();
    const currentScale       = req.body.currentScale || "medium";
    const techStack          = (req.body.techStack || "").trim();

    // Combine extracted text + extra context the user typed
    const combinedInput = extractedText + (userDescription ? "\n\nAdditional context: " + userDescription : "");

    const input = {
      existingHLD: combinedInput,
      improvementsWanted,
      techStack,
      currentScale,
      features: []
    };

    const analysis      = analyzeArchitecture(input);
    const improvedGraph = generateImprovedArchitecture(input, analysis);

    return res.json({
      status: "success",
      fileInfo: {
        name: req.file.originalname,
        size: `${(req.file.size / 1024).toFixed(1)} KB`,
        type: mime,
        charsExtracted: extractedText.length
      },
      analysis,
      improvedGraph
    });

  } catch (err) {
    console.error("HLD analysis error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
}

module.exports = { analyzeHLDFile };
