const express = require("express");
const router = express.Router();

const { generateSystem } = require("../controllers/systemController");

router.post("/generate", generateSystem);

module.exports = router;