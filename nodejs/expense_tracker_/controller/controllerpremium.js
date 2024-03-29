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
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST
});


app.use(cors());
app.use(bodyParser.json());

function generateToken(id){
  return jwt.sign({userid:id},secretKey)
}


exports.getleaderboard= async (req, res) => {
  try {
    const [rows] = await pool.execute(`SELECT * FROM users ORDER BY total_expenses ASC`);

    res.json(rows);
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ error: 'An error occurred while fetching the leaderboard' });
  }
};   



exports.getispremiummember =async (req, res) => {
  try {
    const token = req.header('Authorization');
    const userid = jwt.verify(token, secretKey);

    const [rows] = await pool.execute('SELECT user_id, payment_id FROM orders WHERE user_id = ? AND payment_id IS NOT NULL', [userid.userid]);

    if (rows.length !== 0) {
      res.status(200).json({ key: true });
    } else {
      res.status(200).json({ key: false });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};
