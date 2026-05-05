const express = require("express");
const cors = require("cors");
const session = require("express-session");

const app = express();

// Trust proxy (needed for secure cookies in production)
app.set("trust proxy", 1);

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// Session middleware
app.use(session({
  name: "fixy.sid",
  secret: process.env.SESSION_SECRET || "fixy-super-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set true in production with HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: "lax",
  },
}));

// Routes
const systemRoutes = require("./routes/systemRoutes");
const authRoutes   = require("./routes/authRoutes");

app.use("/api", systemRoutes);
app.use("/api/auth", authRoutes);

// Export for Vercel
module.exports = app;

// Only listen if not on Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Fixy server running on port ${PORT}`);
  });
}