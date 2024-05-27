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
// const AWS=require('aws-sdk')

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


// function uploadToS3(data, filename) {
//   const BUCKET_NAME = 'expensetracker23';
//   const IAM_USER_KEY = process.env.IAM_USER_KEY;
//   const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

//   // Configure AWS SDK
//   AWS.config.update({
//     accessKeyId: IAM_USER_KEY,
//     secretAccessKey: IAM_USER_SECRET
//   });

//   const s3bucket = new AWS.S3();

//   return new Promise((resolve, reject) => {
//     const params = {
//       Bucket: BUCKET_NAME,
//       Key: filename,
//       Body: data,
//       ACL:'public-read'
//     };

//     s3bucket.upload(params, (err, s3response) => {
//       if (err) {
//         console.log('Error uploading to S3:', err);
//         reject(err);
//       } else {
//         console.log('Successfully uploaded to S3:', s3response.Location);
//         resolve(s3response.Location);
//       }
//     });
//   });
// }
// async function download(req, res) {
//   try {
//     const token = req.header('authorization');
//     const userid = jwt.verify(token, secretKey);

//     const [expenses] = await pool.execute('SELECT * FROM expenses WHERE userid=?', [userid.userid]);
//     const stringifiedExpenses = JSON.stringify(expenses);
//     const filename = `expenses${userid}/${new Date()}.txt`;

//     const fileURL = await uploadToS3(stringifiedExpenses, filename);

//     res.status(200).json({ fileURL, success: true });
//   } catch (error) {
//     console.error('Error in download route:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }

// module.exports = download;
const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
require('dotenv').config();

const secretKey = 'e314d73d2ee88c916172ee2b4a82b4a44f0c70db5bfe8c303a30607b8b59a462';
const mongoUri = process.env.MONGODB_URI;
const bucketName = 'expensetracker23';
const accessKeyId = process.env.IAM_USER_KEY;
const secretAccessKey = process.env.IAM_USER_SECRET;

// Configure AWS SDK
AWS.config.update({
  accessKeyId,
  secretAccessKey
});
const s3bucket = new AWS.S3();

// Connect to MongoDB
let db;
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

// Middleware to ensure MongoDB connection is established
async function ensureDBConnection(req, res, next) {
  if (!db) {
    await connectToMongoDB();
  }
  next();
}

// Upload to S3 function
async function uploadToS3(data, filename) {
  const params = {
    Bucket: bucketName,
    Key: filename,
    Body: data,
    ACL: 'public-read'
  };

  try {
    const s3Response = await s3bucket.upload(params).promise();
    console.log('Successfully uploaded to S3:', s3Response.Location);
    return s3Response.Location;
  } catch (err) {
    console.log('Error uploading to S3:', err);
    throw err;
  }
}

// Download expenses
async function download(req, res) {
  try {
    const token = req.header('authorization');
    const decoded = jwt.verify(token, secretKey);
    const userid = decoded.userid;

    // Fetch expenses from MongoDB
    const expenses = await db.collection('expenses').find({ userid: ObjectId(userid) }).toArray();
    const stringifiedExpenses = JSON.stringify(expenses);

    // Upload expenses data to S3
    const filename = `expenses${userid}/${new Date().toISOString()}.txt`;
    const fileURL = await uploadToS3(stringifiedExpenses, filename);

    res.status(200).json({ fileURL, success: true });
  } catch (error) {
    console.error('Error in download route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

router.get('/download', ensureDBConnection, download);

module.exports = router;

