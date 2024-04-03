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
const filePath = path.join(__dirname, 'views', 'reset.html');

const tranEmailApi=new Sib.TransactionalEmailsApi()
const sender={
  email:"tauseef989@gmail.com",
  name:"tauseef"
}


const pool = mysql.createPool({
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST
});

const { v4: uuidv4 } = require('uuid');
// Function to generate UUID for IDs
function generateUUID() {
  return uuidv4();
}
app.use(cors());
app.use(bodyParser.json());

function generateToken(id){
  return jwt.sign({userid:id},secretKey)
}

exports.postnewpassword=async(req,res)=>{
  const {password,uuid}=req.body
  const hashedpassword= await bcrypt.hash(password,10)
  await pool.execute('UPDATE forgotpasswordrequest SET isactive="NO" WHERE id=?',[uuid])
  const [rows]=await pool.execute('SELECT userid FROM forgotpasswordrequest WHERE id=? ',[uuid]) 

  const id =rows[0].userid
  await pool.execute('UPDATE users SET password=? WHERE id=?',[hashedpassword,id])
  console.log("updated sucessfully")
  res.status(200).json({ message: "Password updated successfully" });
}


exports.getresetpassword= async (req, res) => {
  const id = req.params.id;
  const [rows] = await pool.execute('SELECT * FROM forgotpasswordrequest WHERE id=?', [id]);
  const userid = rows[0].userid;

  if (rows[0].isactive === "YES") {
    const token = generateToken(userid);
    res.sendFile(filePath);
  } else {
    console.log("Link is expired");
    res.status(400).json({ error: "Link is expired" });
  }
};



exports.getforgotpassword=async (req, res) => {
  const id = generateUUID();
  const { email } = req.query; 

  try {
    const [rows] = await pool.execute('SELECT id FROM users WHERE email=?', [email]);
    
    if (!rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const userid = rows[0].id;

    await pool.execute('INSERT INTO forgotpasswordrequest (id, userid, isactive) VALUES (?, ?, "YES")', [id, userid]);

    const receivers = [{ email: email }];

    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: 'Password Reset Request',
      textContent: `Please visit the following URL to reset your password: http://44.204.25.6:8000/password/resetpassword/${id}`
    });

    res.status(200).json({ message: "Password reset email sent successfully." });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ error: "An error occurred while sending the password reset email." });
  }
};