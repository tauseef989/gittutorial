
require('dotenv').config();
const express = require("express");
const app=express()
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
exports.filemessage=async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Upload file to AWS S3
    const s3Location = await uploadToS3(req.file.buffer, req.file.originalname);
    console.log('File uploaded to S3:', s3Location);

    // Handle other actions (e.g., save file metadata to database)

    res.status(200).json({ message: 'File uploaded successfully', s3Location });
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}