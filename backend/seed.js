require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// Connect to the same database
const db = new sqlite3.Database("./db/database.sqlite", (err) => {
  if (err) console.error(err.message);
  else console.log("Connected to SQLite database for seeding.");
});

async function seed() {
  try {
    // Create a test user
    const userId = uuidv4();
    const email = "test@example.com";
    const password = "password123";
    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (id, email, password_hash, created_at)
         VALUES (?, ?, ?, ?)`,
        [userId, email, passwordHash, createdAt],
        (err) => (err ? reject(err) : resolve())
      );
    });
    console.log(`User created: email: ${email} password: ${password}`);

    // Create 5 sample todos
    const statuses = ["todo", "in_progress", "done"];
    for (let i = 1; i <= 5; i++) {
      const todoId = uuidv4();
      const title = `Sample Todo ${i}`;
      const description = `This is a sample todo number ${i}`;
      const status = statuses[i % statuses.length];
      const dueDate = new Date(Date.now() + i * 86400000).toISOString(); // due in i days
      const createdAt = new Date().toISOString();
      const updatedAt = createdAt;

      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO todos 
           (id, user_id, title, description, status, due_date, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            todoId,
            userId,
            title,
            description,
            status,
            dueDate,
            createdAt,
            updatedAt,
          ],
          (err) => (err ? reject(err) : resolve())
        );
      });
      console.log("Created todo:", title);
    }

    console.log("Seeding complete!");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    db.close();
  }
}

seed();
