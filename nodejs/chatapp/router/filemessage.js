require('dotenv').config();
const express = require("express");
const app=express()
const router = express.Router(); 
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
  user: 'root',
  database: 'chatapp',
  password: 'aA@11111',
  host: 'localhost'
});

function generateToken(id){
  return jwt.sign({userid:id},process.env.SECRET_KEY)
}
function uploadToS3(data, filename) {
  const BUCKET_NAME = 'chatapp23';
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  // Configure AWS SDK
  AWS.config.update({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET
  });

  const s3bucket = new AWS.S3();

  return new Promise((resolve, reject) => {
    const params = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: data,
      ACL:'public-read'
    };

    s3bucket.upload(params, (err, s3response) => {
      if (err) {
        console.log('Error uploading to S3:', err);
        reject(err);
      } else {
        console.log('Successfully uploaded to S3:', s3response.Location);
        resolve(s3response.Location);
      }
    });
  });
}
const filemessagecontroller=require("../controller/filemessagecontroller");
router.post('/sendMessageWithFile', upload.single('file'), filemessagecontroller.filemessage);

module.exports=router