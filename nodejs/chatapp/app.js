require('dotenv').config();
const express = require("express");
const app=express()
const cors = require("cors");
const fs=require('fs')
const http=require('http')
const PORT=process.env.PORT
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
const signuprouter=require('./router/signup')
const loginrouter=require('./router/login')
const grouprouter=require('./router/group')
const filemessage=require('./router/filemessage')


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


io.on('connection', (socket) => {
  socket.on('sendGroupMessage', async (data) => {
    const { message, name, groupname } = data;
    const token = socket.handshake.auth.token; // Extract token from handshake
    const id = jwt.verify(token, process.env.SECRET_KEY);
    const date = new Date().toISOString();

    console.log(groupname, id.userid, name, message, date);

    try {
      await pool.execute(
        'INSERT INTO groupmessage (groupname,user_id,username,groupmessage,time) VALUES(?,?,?,?,?)',
        [groupname, id.userid, name, message, date]
      );

      const [rows] = await pool.execute(
        'SELECT groupmessage,username FROM groupmessage WHERE groupname=?',
        [groupname]
      );

      if (rows.length < 10) {
        // Send the updated messages to the group
        io.emit('groupMessageSent', rows);
      } else {
        // Send the latest 10 messages to the group
        io.emit('groupMessageSent', rows.slice(rows.length - 10, rows.length));
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      // Send an error response to the client
      // You may want to handle this differently based on your application's requirements
      socket.emit('groupMessageError', { error: 'Failed to save message' });
    }
  });
});
app.use(express.static(path.join(__dirname,'./views')));
app.use(loginrouter);
app.use(signuprouter);
app.use(grouprouter);
app.use(filemessage);


server.listen(PORT,()=>{console.log('running on 8000')})