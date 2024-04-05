require('dotenv').config();
const express = require("express");
const fs=require('fs')
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt=require("bcrypt")
const jwt=require('jsonwebtoken')
const app=express()
const pool = mysql.createPool({
  user: 'root',
  database: 'chatapp',
  password: 'aA@11111',
  host: 'localhost'
});

function generateToken(id){
  return jwt.sign({userid:id},process.env.SECRET_KEY)
}

app.use(cors());
app.use(bodyParser.json());

app.post('/login',async (req, res) => {
  const { Email, Password } = req.body;
  try {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email=?", [Email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const user = rows[0];
    const isValidPassword = await bcrypt.compare(Password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    console.log("Login successful:", user); // Logging the user data retrieved from the database
    // res.redirect('/expenses/expense'); // Redirect to expense.html upon successful login
    res.send({ message: 'Login successfully', token: generateToken(user.id) });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
}
);

app.post('/signup',async (req, res) => {
  const { Name, Email, Number,Password } = req.body;
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [Email]);
    if (rows.length > 0) {
      res.send("User already exists, Please Login")
   
    } else {
      const hashedpassword= await bcrypt.hash(Password,10)
      await pool.execute("INSERT INTO users (name, email,number, password) VALUES (?, ?, ?,?)", [Name, Email,Number, hashedpassword]);
      console.log(Name, Email, hashedpassword);
      res.send("Received successfully");
    
    }

  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
  }
});

app.listen(8000)