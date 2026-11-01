
const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "database.db");

let db = null;

// GET all books
app.get("/books/", async (request, response) => {
  try {
    const books = await db.all("SELECT * FROM book");
    response.status(200).send(books);
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// GET a specific book
app.get("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    const book = await db.get(
      "SELECT * FROM book WHERE id = ?",
      [bookId]
    );

    if (book === undefined) {
      response.status(404).send({ error: "Book not found" });
    } else {
      response.status(200).send(book);
    }
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// POST a new book
app.post("/books/", async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;

    if (
      typeof title !== "string" ||
      typeof author !== "string" ||
      !Number.isInteger(price) ||
      !Number.isInteger(pages)
    ) {
      return response.status(400).send({
        error: "Please provide valid title, author, price and pages"
      });
    }

    const result = await db.run(
      `INSERT INTO book (title, author, price, pages)
       VALUES (?, ?, ?, ?)`,
      [title, author, price, pages]
    );

    response.status(201).send({
      message: "Book added successfully",
      bookId: result.lastID
    });
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// PUT update a book
app.put("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    if (
      typeof title !== "string" ||
      typeof author !== "string" ||
      !Number.isInteger(price) ||
      !Number.isInteger(pages)
    ) {
      return response.status(400).send({
        error: "Please provide valid title, author, price and pages"
      });
    }

    const result = await db.run(
      `UPDATE book
       SET title = ?, author = ?, price = ?, pages = ?
       WHERE id = ?`,
      [title, author, price, pages, bookId]
    );

    if (result.changes === 0) {
      response.status(404).send({ error: "Book not found" });
    } else {
      response.status(200).send({
        message: "Book updated successfully"
      });
    }
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// DELETE a book
app.delete("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    const result = await db.run(
      "DELETE FROM book WHERE id = ?",
      [bookId]
    );

    if (result.changes === 0) {
      response.status(404).send({ error: "Book not found" });
    } else {
      response.status(200).send({
        message: "Book deleted successfully"
      });
    }
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// Initialize database and start server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log(`Database error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
