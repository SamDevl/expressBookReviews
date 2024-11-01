const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    { username: "user1", password: "password1" },
    { username: "user2", password: "password2" },
    { username: "Sam", password: "Devl" }
  ];

//returns boolean
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

//returns boolean
const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

// /customer/login
regd_users.post("/login", (req, res) => {
    console.log(req.body); // Log the incoming request body
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({ message: "Missing username or password" });
    } else if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Incorrect username or password" });
    } else {
        const accessToken = jwt.sign({ data: password }, "access", {
            expiresIn: 60 * 60,
      });
      req.session.authorization = { accessToken, username };
      return res.status(200).json({ message: "User successfully logged in.", accessToken });
    }
});
// Add a book review
// /customer/auth/:isbn
regd_users.put("/auth/review/:isbn", (req, res) => {
    const user = req.session.authorization.username; // Get the username from the session
    const review = req.body.review; // The review text from the request body
    const isbn = req.params.isbn; // The ISBN from the request parameters
  
    // Check if the review text is provided
    if (!review) {
      return res.status(400).json({ message: "Review is empty!" });
    }
  
    // Check if the book exists in the database
    if (!books[isbn]) {
      return res.status(400).json({ message: "Invalid ISBN." });
    }
  
    // If the user already has a review for this ISBN, update it
    if (books[isbn].reviews[user]) {
      books[isbn].reviews[user] = review; // Update the existing review
      return res.status(200).json({ message: "Book review updated." });
    } else {
      // If it's a new review, add it to the reviews object
      books[isbn].reviews[user] = review; // Add the new review
      return res.status(201).json({ message: "Book review added." });
    }
  });

// delete a review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const user = req.session.authorization.username;
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    res.status(400).json({ message: "invalid ISBN." });
  } else if (!books[isbn].reviews[user]) {
    res
      .status(400)
      .json({ message: `${user} hasn't submitted a review for this book.` });
  } else {
    delete books[isbn].reviews[user];
    res.status(200).json({ message: "Book review deleted." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;