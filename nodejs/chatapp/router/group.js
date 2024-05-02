require('dotenv').config();
const express = require('express');// Import the Express module
const app = express();// Create an instance of the Express application
const router = express.Router(); // Import the Router module from Express
const cors = require("cors");
const fs=require('fs')
const http=require('http')
const multer = require('multer');
const upload = multer(); 
const AWS = require('aws-sdk');
const socketIO=require('socket.io')
const server=http.createServer(app)
const io=socketIO(server,{cors
:{origin:"*"}})
const bodyParser = require("body-parser");

const mysql = require("mysql2/promise");
const bcrypt=require("bcrypt")
const jwt=require('jsonwebtoken')

app.use(bodyParser.json());
app.use(cors());

const pool = mysql.createPool({
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST
});

function generateToken(id){
  return jwt.sign({userid:id},process.env.SECRET_KEY)
}


const groupcontroller=require("../controller/groupcontroller");

router.get('/getalluserid',groupcontroller.getalluserid);
router.get('/getgroupuser',groupcontroller.getgroupuser);
router.get('/isadmin',groupcontroller.isadmin);
router.put('/editgroup',groupcontroller.editgroup);
router.post('/creategroup',groupcontroller.creategroup);
router.get('/getgroup',groupcontroller.getgroup);
module.exports=router