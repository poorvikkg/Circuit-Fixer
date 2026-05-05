const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const { generateSystem } = require("../controllers/systemController");
const { improveSystem } = require("../controllers/improveController");
const { reviewCode } = require("../controllers/codeReviewController");
const { analyzeHLDFile } = require("../controllers/hldAnalysisController");

router.post("/generate", generateSystem);
router.post("/improve", improveSystem);
router.post("/code-review", reviewCode);
router.post("/hld-analyze", upload.single("hldFile"), analyzeHLDFile);

module.exports = router;