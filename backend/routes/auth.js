const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// --- Signup ---
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  const errors = [];
  if (!email || !email.includes("@"))
    errors.push({ field: "email", message: "Invalid email" });
  if (!password || password.length < 8)
    errors.push({
      field: "password",
      message: "Must be at least 8 characters",
    });

  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const hash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const sql = `INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)`;
    req.db.run(sql, [id, email, hash], function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.status(400).json({
            errors: [{ field: "email", message: "Email already exists" }],
          });
        }
        return res.status(500).json({ error: "Internal server error" });
      }

      res.status(201).json({ id, email });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Login ---
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  const sql = `SELECT * FROM users WHERE email = ?`;
  req.db.get(sql, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    // Create JWT
    // eslint-disable-next-line no-undef
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    // Set httpOnly cookie
    res.cookie("session", token, {
      httpOnly: true,
      sameSite: "lax",
      // eslint-disable-next-line no-undef
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ id: user.id, email: user.email });
  });
});

// --- Logout ---
router.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.sendStatus(204);
});

module.exports = router;
