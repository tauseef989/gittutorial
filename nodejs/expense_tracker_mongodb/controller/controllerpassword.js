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
// const filePath = path.join(__dirname, 'expenses', 'reset.html');




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

// exports.postnewpassword=async(req,res)=>{
//   const {password,uuid}=req.body
//   const hashedpassword= await bcrypt.hash(password,10)
//   await pool.execute('UPDATE forgotpasswordrequest SET isactive="NO" WHERE id=?',[uuid])
//   const [rows]=await pool.execute('SELECT userid FROM forgotpasswordrequest WHERE id=? ',[uuid]) 

//   const id =rows[0].userid
//   await pool.execute('UPDATE users SET password=? WHERE id=?',[hashedpassword,id])
//   console.log("updated sucessfully")
//   res.status(200).json({ message: "Password updated successfully" });
// }


// exports.getresetpassword= async (req, res) => {
//   const id = req.params.id;
//   const [rows] = await pool.execute('SELECT * FROM forgotpasswordrequest WHERE id=?', [id]);
//   const userid = rows[0].userid;

//   if (rows[0].isactive === "YES") {
//     const token = generateToken(userid);
//     res.sendFile(filePath);
//   } else {
//     console.log("Link is expired");
//     res.status(400).json({ error: "Link is expired" });
//   }
// };



// exports.getforgotpassword=async (req, res) => {
//   const id = generateUUID();
//   const { email } = req.query; 

//   try {
//     const [rows] = await pool.execute('SELECT id FROM users WHERE email=?', [email]);
    
//     if (!rows.length) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const userid = rows[0].id;

//     await pool.execute('INSERT INTO forgotpasswordrequest (id, userid, isactive) VALUES (?, ?, "YES")', [id, userid]);

//     const receivers = [{ email: email }];

//     await tranEmailApi.sendTransacEmail({
//       sender,
//       to: receivers,
//       subject: 'Password Reset Request',
//       textContent: `Please visit the following URL to reset your password: http://localhost:8000/password/resetpassword/${id}`
//     });

//     res.status(200).json({ message: "Password reset email sent successfully." });
//   } catch (error) {
//     console.error("Error sending password reset email:", error);
//     res.status(500).json({ error: "An error occurred while sending the password reset email." });
//   }
// };
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const secretKey ='e314d73d2ee88c916172ee2b4a82b4a44f0c70db5bfe8c303a30607b8b59a462';
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const filePath = path.join(__dirname, 'expenses', 'reset.html');

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

// Generate UUID
function generateUUID() {
  return uuidv4();
}

// Generate JWT Token
function generateToken(id) {
  return jwt.sign({ userid: id }, secretKey);
}

// Update user password
router.post('/postnewpassword', async(req, res) => {
  const { password, uuid } = req.body;
  const hashedpassword = await bcrypt.hash(password, 10);
  try {
    await db.collection('forgotpasswordrequest').updateOne({ _id: uuid }, { $set: { isactive: "NO" } });
    const forgotPasswordRequest = await db.collection('forgotpasswordrequest').findOne({ _id: uuid });
    const id = forgotPasswordRequest.userid;
    await db.collection('users').updateOne({ _id: id }, { $set: { password: hashedpassword } });
    console.log("updated successfully");
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// Get reset password page
router.get('/getresetpassword/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const forgotPasswordRequest = await db.collection('forgotpasswordrequest').findOne({ _id: id });
    const userid = forgotPasswordRequest.userid;
    if (forgotPasswordRequest.isactive === "YES") {
      const token = generateToken(userid);
      res.sendFile(filePath);
    } else {
      console.log("Link is expired");
      res.status(400).json({ error: "Link is expired" });
    }
  } catch (error) {
    console.error("Error getting reset password:", error);
    res.status(500).json({ error: "Failed to get reset password" });
  }
});

// Send forgot password email
router.get('/getforgotpassword', async (req, res) => {
  const id = generateUUID();
  const { email } = req.query;
  try {
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await db.collection('forgotpasswordrequest').insertOne({ _id: id, userid: user._id, isactive: "YES" });
    // Send email code here
    res.status(200).json({ message: "Password reset email sent successfully." });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ error: "An error occurred while sending the password reset email." });
  }
});

module.exports = router;
