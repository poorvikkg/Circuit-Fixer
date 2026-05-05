const { crawlRepo, parseRepoUrl } = require("../services/githubCrawlerService");
const { detectIssues } = require("../engine/codeReviewEngine");

async function reviewCode(req, res) {
  try {
    const { repoUrl, githubToken, focusPaths } = req.body;

    if (!repoUrl) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a valid GitHub repository URL (e.g. https://github.com/owner/repo) or owner/repo"
      });
    }

    const { owner, repo } = parseRepoUrl(repoUrl);

    // Crawl the repo
    let files;
    try {
      files = await crawlRepo(owner, repo, githubToken || null, 50);
    } catch (crawlErr) {
      return res.status(400).json({
        status: "error",
        message: crawlErr.message || "Failed to crawl repository. Ensure it is public or provide a GitHub token."
      });
    }

    if (files.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No code files found in this repository. Only JS/TS/Python/Go/Java etc. files are supported."
      });
    }

    const review = detectIssues(files);

    return res.json({
      status: "success",
      repo: { owner, repo, filesCrawled: files.length },
      review,
      fileTree: files.map(file => ({ path: file.path, language: file.language, lines: file.content.split("\n").length }))
    });

  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

module.exports = { reviewCode };
