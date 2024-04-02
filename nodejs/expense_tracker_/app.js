require('dotenv').config();
const express = require("express");
const fs=require('fs')
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt=require("bcrypt")
const path = require('path');
const jwt=require("jsonwebtoken")
const crypto=require("crypto")
const Razorpay=require('razorpay')
const secretKey ='e314d73d2ee88c916172ee2b4a82b4a44f0c70db5bfe8c303a30607b8b59a462'
const PORT = process.env.PORT;
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET; 
const Sib =require("sib-api-v3-sdk")
const client=Sib.ApiClient.instance
const apiKey=client.authentications['api-key']
apiKey.apiKey=process.env.API_KEY 
const tranEmailApi=new Sib.TransactionalEmailsApi()
const sender={
  email:"tauseef989@gmail.com",
  name:"tauseef"
}
const { v4: uuidv4 } = require('uuid');
// Function to generate UUID for IDs
function generateUUID() {
  return uuidv4();
}
const morgan=require('morgan')
// const helmet=require('helmet')
const AWS=require('aws-sdk')
const orderrouter=require("./router/orders")
const expensesrouter=require("./router/expenses")
const signuprouter=require("./router/signup")
const loginrouter=require('./router/login')
const premiumrouter=require('./router/premium')
const passwordrouter=require('./router/password')
const downloadrouter=require('./router/download')
const filePath = path.join(__dirname, 'expenses', 'reset.html');

const app = express();
const pool = mysql.createPool({
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST
});

const accesslogstream=fs.createWriteStream(path.join(__dirname,'access.log'),{flags :'a'})
// app.use(helmet())
app.use(morgan('combined',{stream:accesslogstream }))
app.use(cors());
app.use(bodyParser.json());

function generateToken(id){
  return jwt.sign({userid:id},secretKey)
}



function uploadToS3(data, filename) {
  const BUCKET_NAME = 'expensetracker23';
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

app.use((req,res)=>{
  res.sendFile(path.join(__dirname,`views/${req.url}`))
})
app.use(downloadrouter)
app.use('/purchase',orderrouter)
app.use('/expenses', expensesrouter)
app.use('/signup',signuprouter)
app.use('/login',loginrouter)
app.use('/premium',premiumrouter)
app.use('/password',passwordrouter)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});