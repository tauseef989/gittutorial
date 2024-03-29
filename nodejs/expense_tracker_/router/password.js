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
const filePath = path.join(__dirname, 'expenses', 'reset.html');




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
const controllerpassword=require('../controller/controllerpassword')

router.post("/newpassword",controllerpassword.postnewpassword)
router.get("/resetpassword/:id", controllerpassword.getresetpassword);
router.get("/forgotpassword",controllerpassword.getforgotpassword);
module.exports=router