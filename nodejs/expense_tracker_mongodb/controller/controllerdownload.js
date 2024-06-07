
// module.exports = download;
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const { MongoClient } = require('mongodb');
const secretKey = 'e314d73d2ee88c916172ee2b4a82b4a44f0c70db5bfe8c303a30607b8b59a462';
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI;
const dbName = "expensetracker";
let db;

async function connectToMongoDB() {
  try {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(dbName);
    // console.log('Connected successfully to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

connectToMongoDB();

function generateToken(id) {
  return jwt.sign({ userid: id }, secretKey);
}

function uploadToS3(data, filename) {
  const BUCKET_NAME = 'expensetrackingapp123';
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
      ACL: 'public-read'
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

async function download(req, res) {
  try {
    const token = req.header('authorization');
    const userid = jwt.verify(token, secretKey).userid;

    const expenses = await db.collection('expenses').find({ userid }).toArray();
    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `expenses${userid}/${new Date()}.txt`;

    const fileURL = await uploadToS3(stringifiedExpenses, filename);

    res.status(200).json({ fileURL, success: true });
  } catch (error) {
    console.error('Error in download route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = download;


