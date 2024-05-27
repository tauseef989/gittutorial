// const express = require('express');// Import the Express module
// const app = express();// Create an instance of the Express application
// const router = express.Router(); // Import the Router module from Express


// const bodyParser = require("body-parser");
// const cors = require("cors");
// const mysql = require("mysql2/promise");
// const bcrypt=require("bcrypt")
// const path = require('path');
// const jwt=require("jsonwebtoken")
// const crypto=require("crypto")
// const Razorpay=require('razorpay')
// const secretKey ='e314d73d2ee88c916172ee2b4a82b4a44f0c70db5bfe8c303a30607b8b59a462'
// require('dotenv').config();




// const pool = mysql.createPool({
//   user: process.env.DB_USER,
//   database: process.env.DB_DATABASE,
//   password: process.env.DB_PASSWORD,
//   host: process.env.DB_HOST
// });


// app.use(cors());
// app.use(bodyParser.json());

// function generateToken(id){
//   return jwt.sign({userid:id},secretKey)
// }


// exports.getleaderboard= async (req, res) => {
//   try {
//     const [rows] = await pool.execute(`SELECT * FROM users ORDER BY total_expenses ASC`);

//     res.json(rows);
//   } catch (error) {
//     console.error('An error occurred:', error);
//     res.status(500).json({ error: 'An error occurred while fetching the leaderboard' });
//   }
// };   



// exports.getispremiummember =async (req, res) => {
//   try {
//     const token = req.header('Authorization');
//     const userid = jwt.verify(token, secretKey);

//     const [rows] = await pool.execute('SELECT user_id, payment_id FROM orders WHERE user_id = ? AND payment_id IS NOT NULL', [userid.userid]);

//     if (rows.length !== 0) {
//       res.status(200).json({ key: true });
//     } else {
//       res.status(200).json({ key: false });
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "An internal server error occurred" });
//   }
// };
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const secretKey = 'e314d73d2ee88c916172ee2b4a82b4a44f0c70db5bfe8c303a30607b8b59a462';
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI;
let db;

async function connectToMongoDB() {
  try {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(); // Use the default database or specify the database name if needed
    console.log('Connected successfully to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

connectToMongoDB();

// Generate JWT Token
function generateToken(id) {
  return jwt.sign({ userid: id }, secretKey);
}

// Get leaderboard
router.get('/getleaderboard', async (req, res) => {
  try {
    const leaderboard = await db.collection('users').find().sort({ total_expenses: 1 }).toArray();
    res.json(leaderboard);
  } catch (error) {
    console.error('An error occurred while fetching the leaderboard:', error);
    res.status(500).json({ error: 'An error occurred while fetching the leaderboard' });
  }
});

// Check if user is a premium member
router.get('/getispremiummember', async (req, res) => {
  try {
    const token = req.header('Authorization');
    const { userid } = jwt.verify(token, secretKey);
    const order = await db.collection('orders').findOne({ user_id: userid, payment_id: { $exists: true } });
    if (order) {
      res.status(200).json({ key: true });
    } else {
      res.status(200).json({ key: false });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

module.exports = router;

