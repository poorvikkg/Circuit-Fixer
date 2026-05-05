const https = require("https");

// Fetch JSON from GitHub API
function githubGet(url, token) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: "api.github.com",
      path: url,
      headers: {
        "User-Agent": "Fixy-App/1.0",
        "Accept": "application/vnd.github.v3+json",
        ...(token ? { "Authorization": `token ${token}` } : {})
      }
    };
    https.get(opts, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(e); }
      });
    }).on("error", reject);
  });
}

// Parse GitHub URL to owner/repo
function parseRepoUrl(url) {
  let cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/i, "").replace(/\/$/, "");
  
  if (cleanUrl.includes("github.com/")) {
    const parts = cleanUrl.split("github.com/")[1].split("/");
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
    }
  } else {
    // maybe it's just 'owner/repo'
    const parts = cleanUrl.split("/");
    if (parts.length === 2) {
      return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
    }
  }
  
  throw new Error("Invalid GitHub URL. Format: https://github.com/owner/repo or owner/repo");
}

// Decode base64 content
function decodeContent(encoded) {
  return Buffer.from(encoded, "base64").toString("utf-8");
}

// Supported code extensions
const CODE_EXTS = [".js", ".ts", ".jsx", ".tsx", ".py", ".go", ".java", ".cs", ".rb", ".php", ".rs", ".swift", ".kt"];

function getLanguage(filename) {
  for (const ext of CODE_EXTS) {
    if (filename.endsWith(ext)) return ext.slice(1);
  }
  return null;
}

// Recursively crawl repo tree
async function crawlRepo(owner, repo, token, maxFiles = 40) {
  const files = [];
  const tree = await githubGet(`/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, token);

  if (tree.message && tree.message.includes("API rate limit")) {
    throw new Error("GitHub API rate limit exceeded. Please generate a Personal Access Token in your GitHub settings and paste it below.");
  }

  if (!tree.tree) {
    throw new Error(tree.message || "Could not fetch repo tree. Make sure the repo is public.");
  }

  const fetchFile = async (item) => {
    try {
      const fileData = await githubGet(`/repos/${owner}/${repo}/contents/${item.path}`, token);
      if (fileData.encoding === "base64" && fileData.content) {
        return {
          path: item.path,
          language: getLanguage(item.path),
          content: decodeContent(fileData.content),
          size: item.size
        };
      }
    } catch (e) {
      return null;
    }
  };

  const codeFiles = tree.tree
    .filter(item => item.type === "blob" && getLanguage(item.path))
    .slice(0, maxFiles);

  const results = await Promise.all(codeFiles.map(fetchFile));
  files.push(...results.filter(Boolean));

  return files;
}

module.exports = { crawlRepo, parseRepoUrl };
