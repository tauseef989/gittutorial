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
const signuprouter=require('./router/signup')
const loginrouter=require('./router/login')
const grouprouter=require('./router/group')
const filemessage=require('./router/filemessage')


io.on('connection', (socket) => {
  console.log(">>>>>socket")
  socket.on('sendGroupMessage', async (data) => {
    console.log(">>>",data)
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
app.use(loginrouter);
app.use(signuprouter);
app.use(grouprouter);
app.use(filemessage);
server.listen(8000,()=>{console.log('running on 8000')})