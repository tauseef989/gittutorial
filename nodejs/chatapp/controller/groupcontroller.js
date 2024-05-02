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
exports.getgroup=async(req,res)=>{
  const token=req.header('Authorization')
  const id =jwt.verify(token,process.env.SECRET_KEY)
  try {
    const [rows] = await pool.execute('SELECT group_id FROM groupmember WHERE user_id = ?', [id.userid]);
    const arr=["common-group"]
    for(const val of rows){
      const group_id=val.group_id
      const [row]=await pool.execute('SELECT group_name FROM grouptable WHERE group_id= ?',[group_id]);
      arr.push(row[0].group_name)
    }
    res.send(arr)
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
    
  }

}
exports.getalluserid=async(req,res)=>{
  const token=req.header('Authorization')
  const id =jwt.verify(token,process.env.SECRET_KEY)
  try {
    const [rows] = await pool.execute('SELECT id FROM users WHERE id != ?', [id.userid]);
    res.send(rows)
    
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
    
  }
}

exports.getgroupuser=async (req,res)=>{
  const token=req.header('Authorization')
  const groupname=req.query.groupname;
  const id= jwt.verify(token,process.env.SECRET_KEY)
  try{

    const [rows]= await pool.execute('SELECT groupmessage,username FROM groupmessage WHERE groupname=?',[groupname])
    if (rows.length<10){
      res.status(201).json(rows)
    }
    else{
      res.status(201).json(rows.slice(rows.length-10,rows.length))
    }}




  
  catch(error){
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });

  }
}

exports.isadmin=async (req, res) => {
  try {
    const token = req.header('Authorization');
    const groupname = req.query.groupname;
    const id = jwt.verify(token, process.env.SECRET_KEY);
    
    const [row] = await pool.execute('SELECT admin FROM grouptable WHERE group_name=?', [groupname]);
    
    let isAdmin = false;
    for (const val of row) {
      if (val.admin == id.userid) {
        isAdmin = true;
        break;
      }
    }
    // console.log(">>",isAdmin)
    res.send(isAdmin);
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).send('Error checking admin status');
  }
}

exports.editgroup=async (req, res) => {
  const { groupname, selectedUserIds,oldgroupname } = req.body;
  const token = req.header('Authorization');
  const id = jwt.verify(token, process.env.SECRET_KEY);
  const date = new Date().toISOString();
  console.log(">>>",groupname,selectedUserIds,oldgroupname)

  try {
    // update group data into grouptable
    await pool.execute( 'UPDATE grouptable SET group_name = ? WHERE group_name = ?', [groupname,oldgroupname]);
    // Get the group ID of the newly inserted group 
    const [rows] = await pool.execute('SELECT group_id FROM grouptable WHERE group_name=?',[groupname]);
    const group = rows[0].group_id;
    console.log("...>",group)

    // Insert admin into groupmember table
    await pool.execute('DELETE FROM groupmember WHERE group_id = ?', [group]);

     // Insert admin into groupmember table
     await pool.execute('INSERT INTO groupmember (group_id, user_id) VALUES (?, ?)',[group, id.userid]);
    // Insert selected users into groupmember table
    for (const val of selectedUserIds) {
      await pool.execute('INSERT INTO groupmember (group_id, user_id) VALUES (?, ?)',[group, val]);
    }

    res.status(200).send('OK')
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while creating the group");
  }
}
exports.creategroup = async (req, res) => {
  const { groupname, selectedUserIds } = req.body;
  const token = req.header('Authorization');

  try {
    // Verify JWT token
    const id = jwt.verify(token, process.env.SECRET_KEY);

    // Insert group data into grouptable
    const date = new Date().toISOString();
    await pool.execute('INSERT INTO grouptable (group_name, admin, created_at) VALUES (?, ?, ?)', [groupname, id.userid, date]);

    // Get the group ID of the newly inserted group
    const [rows] = await pool.execute('SELECT LAST_INSERT_ID() AS group_id');
    const group = rows[0].group_id;

    // Insert admin into groupmember table
    await pool.execute('INSERT INTO groupmember (group_id, user_id) VALUES (?, ?)', [group, id.userid]);

    // Insert selected users into groupmember table
    for (const val of selectedUserIds) {
      await pool.execute('INSERT INTO groupmember (group_id, user_id) VALUES (?, ?)', [group, val]);
    }

    // Send success response with group ID
    res.status(200).json({ group_id: group, message: 'Group created successfully' });
  } catch (error) {
    console.error("Error:", error);
    // Send error response
    res.status(500).json({ error: 'An error occurred while creating the group' });
  }
};
