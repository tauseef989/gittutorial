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
const Razorpay=require('razorpay');
const { connected } = require('process');
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
const expensescontroller=require('../controller/controllerexpenses')
// Endpoint to handle expense creation
router.post('/', expensescontroller.post) 
// Endpoint to fetch all expense
router.get('/', expensescontroller.get);
// Endpoint to delete an expense by ID
router.delete('/:id', expensescontroller.delete);
module.exports=router