// ===============================
// Auth Controller — Session-based Auth
// ===============================
const bcrypt = require("bcryptjs");

// In-memory user store (replace with DB for production)
const users = {};

// ── Pre-seed demo / recruiter account ──────────────────────────────────────
// This runs once at startup so the demo credentials always work,
// even after a server restart (since the store is in-memory).
(async () => {
  const DEMO_EMAIL    = "demo@circuitfixer.com";
  const DEMO_PASSWORD = "Demo@1234";
  const hashed = await bcrypt.hash(DEMO_PASSWORD, 12);
  users[DEMO_EMAIL] = {
    email: DEMO_EMAIL,
    password: hashed,
    createdAt: new Date().toISOString(),
  };
  console.log(`[Auth] Demo user seeded → ${DEMO_EMAIL}`);
})();

// POST /api/auth/register
async function register(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: "error", message: "Email and password are required." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ status: "error", message: "Invalid email address." });
    }
    if (password.length < 8) {
      return res.status(400).json({ status: "error", message: "Password must be at least 8 characters." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (users[normalizedEmail]) {
      return res.status(409).json({ status: "error", message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    users[normalizedEmail] = {
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    // Auto-login after register
    req.session.user = { email: normalizedEmail };
    req.session.save();

    return res.json({ status: "success", user: { email: normalizedEmail } });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: "error", message: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = users[normalizedEmail];

    if (!user) {
      return res.status(401).json({ status: "error", message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: "error", message: "Invalid email or password." });
    }

    req.session.user = { email: normalizedEmail };
    req.session.save();

    return res.json({ status: "success", user: { email: normalizedEmail } });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
}

// POST /api/auth/logout
function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie("fixy.sid");
    return res.json({ status: "success", message: "Logged out." });
  });
}

// GET /api/auth/me
function me(req, res) {
  if (req.session && req.session.user) {
    return res.json({ status: "success", user: req.session.user });
  }
  return res.status(401).json({ status: "error", message: "Not authenticated." });
}

module.exports = { register, login, logout, me };
