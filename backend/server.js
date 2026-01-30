const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todos");
const requireAuth = require("./middleware/requireAuth");

const app = express();
const PORT = 3000;

// eslint-disable-next-line no-undef
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

// middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // needed if you want cookies sent
  })
);
app.use(express.json());
app.use(cookieParser());

// connect to SQLite
const db = new sqlite3.Database("./db/database.sqlite", (err) => {
  if (err) console.error(err.message);
  console.log("Connected to SQLite database.");
});

// attach db to req for route handlers
app.use((req, res, next) => {
  req.db = db;
  next();
});

// create tables
db.exec(`
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo','in_progress','done')),
  due_date TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos(user_id);
CREATE INDEX IF NOT EXISTS todos_status_idx ON todos(status);
CREATE INDEX IF NOT EXISTS todos_created_at_idx ON todos(created_at);
`);

// route mounting

app.use("/api/auth", authRoutes);
app.use("/api/todos", requireAuth, todoRoutes);

// error handler
app.use((err, req, res) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
