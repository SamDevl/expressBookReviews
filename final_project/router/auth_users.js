const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (user)=>{ //returns boolean
    let filtered_users = users.filter((user)=> user.username === user);
    if(filtered_users){
        return true;
    }
    return false;
}
const authenticatedUser = (username,password)=>{ //returns boolean
    if(isValid(username)){
        let filtered_users = users.filter((user)=> (user.username===username)&&(user.password===password));
        if(filtered_users){
            return true;
        }
        return false;
       
    }
    return false;
    

}

regd_users.post("/register", (req,res) => {
    //Write your code here
    const username = req.body.username;
    const password = req.body.password;
    if(username&&password){
        const present = users.filter((user)=> user.username === username)
        if(present.length===0){
            users.push({"username":req.body.username,"password":req.body.password});
            return res.status(201).json({message:"USer Created successfully"})
        }
        else{
          return res.status(400).json({message:"Already exists"})
        }
    }
    else if(!username && !password){
      return res.status(400).json({message:"Bad request"})
    }
    else if(!username || !password){
      return res.status(400).json({message:"Check username and password"})
    }
  
   
  });

//only registered users can login
regd_users.post("/login", (req,res) => {
    let user = req.body.username;
    let pass = req.body.password;
    if(!authenticatedUser(user,pass)){
        return res.status(403).json({message:"User not authenticated"})
    }

    let accessToken = jwt.sign({
        data: user
    },'access',{expiresIn:60*60})
    req.session.authorization = {
        accessToken
    }
    res.send("User logged in Successfully")
 
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const user = req.session.username; // Get the username from the session
    const isbn = req.params.isbn; // The ISBN from the request parameters
    const review = req.query.review; // The review text from the request query

    // Check if the review text is provided
    if (!review) {
        return res.status(400).json({ message: "Review is empty!" });
    }

    // Check if the book exists in the database
    if (!books[isbn]) {
        return res.status(400).json({ message: "Invalid ISBN." });
    }

    // Add or update the review
    books[isbn].reviews[user] = review; // Use the username as the key for the review

    return res.status(201).json({ message: "Review added/updated successfully." });
});

// Delete a review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const user = req.session.username; // Get the username from the session
    const isbn = req.params.isbn; // The ISBN from the request parameters

    // Check if the book exists in the database
    if (!books[isbn]) {
        return res.status(400).json({ message: "Invalid ISBN." });
    }

    // Check if the user has submitted a review for this ISBN
    if (!books[isbn].reviews[user]) {
        return res.status(400).json({ message: "No review found for this user." });
    }

    // Delete the user's review
    delete books[isbn].reviews[user];
    return res.status(200).json({ message: "Review has been deleted." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;