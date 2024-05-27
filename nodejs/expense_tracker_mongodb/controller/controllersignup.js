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

// exports.postsignup=async (req, res) => {
//   const { Name, Email, Password } = req.body;
//   try {
//     const hashedpassword= await bcrypt.hash(Password,10)
//     await pool.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [Name, Email, hashedpassword]);
//     console.log(Name, Email, hashedpassword);
//     res.send("Received successfully");
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).send("Error occurred");
//   }
// };
const express = require('express');
const router = express.Router();
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

// Signup endpoint
router.post('/signup', async (req, res) => {
  const { Name, Email, Password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    await db.collection('users').insertOne({ name: Name, email: Email, password: hashedPassword });
    console.log(`${Name}, ${Email}, ${hashedPassword}`);
    res.send("Received successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
  }
});

module.exports = router;

