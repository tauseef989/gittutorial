const express = require('express');// Import the Express module
const app = express();// Create an instance of the Express application
const router = express.Router(); // Import the Router module from Express


const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt=require("bcrypt")
const path = require('path');
const jwt=require("jsonwebtoken")
const crypto=require("crypto")
const Razorpay=require('razorpay')
const secretKey ='e314d73d2ee88c916172ee2b4a82b4a44f0c70db5bfe8c303a30607b8b59a462'
require('dotenv').config();




const pool = mysql.createPool({
  user: 'root',
  database: 'expense',
  password: 'aA@11111',
  host: 'localhost'
});


app.use(cors());
app.use(bodyParser.json());

function generateToken(id){
  return jwt.sign({userid:id},secretKey)
}

router.post("/signup", async (req, res) => {
  const { Name, Email, Password } = req.body;
  try {
    const hashedpassword= await bcrypt.hash(Password,10)
    await pool.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [Name, Email, hashedpassword]);
    console.log(Name, Email, hashedpassword);
    res.send("Received successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
  }
});

module.exports=router