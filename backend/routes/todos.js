const express = require("express");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// --- GET /api/todos ---
// Query: status, search, sortBy (created_at|due_date), sortOrder (asc|desc)
router.get("/", (req, res) => {
  const userId = req.user.id;
  const {
    status,
    search,
    sortBy = "created_at",
    sortOrder = "asc",
  } = req.query;

  let sql = `SELECT * FROM todos WHERE user_id = ?`;
  const params = [userId];

  if (status) {
    sql += ` AND status = ?`;
    params.push(status);
  }

  if (search) {
    sql += ` AND title LIKE ?`;
    params.push(`%${search}%`);
  }

  // Validate sortBy
  const validSort = ["created_at", "due_date"];
  if (!validSort.includes(sortBy))
    return res.status(400).json({ error: "Invalid sortBy" });

  const order = sortOrder === "desc" ? "DESC" : "ASC";
  sql += ` ORDER BY ${sortBy} ${order}`;

  req.db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    res.json({ items: rows });
  });
});

// --- POST /api/todos ---
router.post("/", (req, res) => {
  const userId = req.user.id;
  const {
    title,
    description = "",
    due_date = null,
    status = "todo",
  } = req.body;

  // Validation
  const errors = [];
  if (!title || title.length > 120)
    errors.push({ field: "title", message: "Title required, max 120 chars" });
  if (description.length > 2000)
    errors.push({ field: "description", message: "Max 2000 chars" });
  const validStatus = ["todo", "in_progress", "done"];
  if (!validStatus.includes(status))
    errors.push({ field: "status", message: "Invalid status" });

  if (errors.length > 0) return res.status(400).json({ errors });

  const id = uuidv4();
  const sql = `INSERT INTO todos (id, user_id, title, description, status, due_date) VALUES (?, ?, ?, ?, ?, ?)`;
  req.db.run(
    sql,
    [id, userId, title, description, status, due_date],
    function (err) {
      if (err) return res.status(500).json({ error: "Internal server error" });
      res
        .status(201)
        .json({ id, user_id: userId, title, description, status, due_date });
    }
  );
});

// --- GET /api/todos/:id ---
router.get("/:id", (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const sql = `SELECT * FROM todos WHERE id = ? AND user_id = ?`;
  req.db.get(sql, [id, userId], (err, todo) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json(todo);
  });
});

// --- PATCH /api/todos/:id ---
router.patch("/:id", (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { title, description, status, due_date } = req.body;

  // Build dynamic query
  const fields = [];
  const params = [];

  if (title !== undefined) {
    if (!title || title.length > 120)
      return res.status(400).json({ error: "Title invalid" });
    fields.push("title = ?");
    params.push(title);
  }

  if (description !== undefined) {
    if (description.length > 2000)
      return res.status(400).json({ error: "Description too long" });
    fields.push("description = ?");
    params.push(description);
  }

  if (status !== undefined) {
    const validStatus = ["todo", "in_progress", "done"];
    if (!validStatus.includes(status))
      return res.status(400).json({ error: "Invalid status" });
    fields.push("status = ?");
    params.push(status);
  }

  if (due_date !== undefined) {
    fields.push("due_date = ?");
    params.push(due_date);
  }

  if (fields.length === 0)
    return res.status(400).json({ error: "No fields to update" });

  // Update updated_at
  fields.push("updated_at = CURRENT_TIMESTAMP");

  const sql = `UPDATE todos SET ${fields.join(
    ", "
  )} WHERE id = ? AND user_id = ?`;
  params.push(id, userId);

  req.db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (this.changes === 0)
      return res.status(404).json({ error: "Todo not found" });

    // Return updated todo
    req.db.get(
      `SELECT * FROM todos WHERE id = ? AND user_id = ?`,
      [id, userId],
      (err, todo) => {
        if (err)
          return res.status(500).json({ error: "Internal server error" });
        res.json(todo);
      }
    );
  });
});

// --- DELETE /api/todos/:id ---
router.delete("/:id", (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const sql = `DELETE FROM todos WHERE id = ? AND user_id = ?`;
  req.db.run(sql, [id, userId], function (err) {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (this.changes === 0)
      return res.status(404).json({ error: "Todo not found" });
    res.sendStatus(204);
  });
});

module.exports = router;
