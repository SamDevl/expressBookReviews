const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
        const present = users.filter((user) => user.username === username);
        if (present.length === 0) {
            users.push({ "username": username, "password": password });
            return res.status(201).json({ message: "User created successfully" });
        } else {
            return res.status(400).json({ message: "User already exists" });
        }
    } else {
        return res.status(400).json({ message: "Check username and password" });
    }
});

// Get the book list available in the shop using async/await
public_users.get('/', async (req, res) => {
    try {
        const getBooks = () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(books);
                }, 1000);
            });
        };
        
        const booksList = await getBooks();
        res.json(booksList);
    } catch (err) {
        res.status(500).json({ error: "An error occurred" });
    }
});

// Get book details based on ISBN using async/await
public_users.get('/isbn/:isbn', async (req, res) => {
    const ISBN = req.params.isbn;

    try {
        const booksBasedOnIsbn = () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const book = books[ISBN];
                    if (book) {
                        resolve(book);
                    } else {
                        reject(new Error("Book not found"));
                    }
                }, 1000);
            });
        };

        const book = await booksBasedOnIsbn();
        res.json(book);
    } catch (err) {
        res.status(400).json({ error: "Book not found" });
    }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;

    try {
        const booksBasedOnAuthor = () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const filteredBooks = books.filter((b) => b.author === author);
                    resolve(filteredBooks);
                }, 1000);
            });
        };

        const filteredBooks = await booksBasedOnAuthor();
        if (filteredBooks.length > 0) {
            res.json(filteredBooks);
        } else {
            res.status(404).json({ error: "No books found for this author" });
        }
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;

    try {
        const booksBasedOnTitle = () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const filteredBooks = books.filter((b) => b.title === title);
                    resolve(filteredBooks);
                }, 1000);
            });
        };

        const filteredBooks = await booksBasedOnTitle();
        if (filteredBooks.length > 0) {
            res.json(filteredBooks);
        } else {
            res.status(404).json({ error: "No books found with this title" });
        }
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book && book.reviews) {
        res.json(book.reviews);
    } else {
        res.status(400).json({ error: "No reviews found for this book" });
    }
});

module.exports.general = public_users;