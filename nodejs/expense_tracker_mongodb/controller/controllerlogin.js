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


// exports.post=async (req, res) => {
//   const { Email, Password } = req.body;
//   try {
//     const [rows] = await pool.execute("SELECT * FROM users WHERE email=?", [Email]);
//     if (rows.length === 0) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }
//     const user = rows[0];
//     const isValidPassword = await bcrypt.compare(Password, user.password);
//     if (!isValidPassword) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }
//     console.log("Login successful:", user); // Logging the user data retrieved from the database
//     // res.redirect('/expenses/expense'); // Redirect to expense.html upon successful login
//     res.send({ message: 'Login successfully', token: generateToken(user.id) });

//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "An internal server error occurred" });
//   }
// };
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const router = express.Router();

const secretKey = 'e314d73d2ee88c916172ee2b4a82b4a44f0c70db5bfe8c303a30607b8b59a462';
const mongoUri = process.env.MONGODB_URI;

let db;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db('expensetracker'); // Use the 'expensetracker' database
    console.log('Connected successfully to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}
connectToMongoDB();

// Generate JWT token
function generateToken(id) {
  return jwt.sign({ userid: id }, secretKey);
}

// Endpoint to handle user authentication
router.post('/login', async (req, res) => {
  const { Email, Password } = req.body;
  try {
    // Find user by email in MongoDB
    const user = await db.collection('users').findOne({ email: Email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare passwords
    const isValidPassword = await bcrypt.compare(Password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('Login successful:', user);
    res.send({ message: 'Login successfully', token: generateToken(user._id) });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

module.exports = router;



