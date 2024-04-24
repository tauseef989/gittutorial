require('dotenv').config();
const express = require("express");
const fs=require('fs')
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt=require("bcrypt")
const jwt=require('jsonwebtoken')
const app=express()
const pool = mysql.createPool({
  user: 'root',
  database: 'chatapp',
  password: 'aA@11111',
  host: 'localhost'
});

function generateToken(id){
  return jwt.sign({userid:id},process.env.SECRET_KEY)
}

app.use(cors());
app.use(bodyParser.json());

app.post('/user',async (req,res)=>{
  const {message,name}=req.body 
  const token=req.header('Authorization')
  const id= jwt.verify(token,process.env.SECRET_KEY)
  const date=new Date().toISOString()
  console.log(message,token,id,date)
  try{
    await pool.execute('INSERT INTO chat (id,message,name,dateandtime) VALUES(?,?,?,?)',[id.userid,message,name,date])
    const [rows]= await pool.execute('SELECT message,name FROM chat')
    if (rows.length<10){
      res.status(201).json(rows)
    }
    else{
      res.status(201).json(rows.slice(rows.length-10,rows.length))
    }
    



  }
  catch(error){
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });

  }
})
app.get('/user',async (req,res)=>{
  const token=req.header('Authorization')
  const id= jwt.verify(token,process.env.SECRET_KEY)
  try{
    const [rows]= await pool.execute('SELECT message,name FROM chat')
    if (rows.length<10){
      res.status(201).json(rows)
    }
    else{
      res.status(201).json(rows.slice(rows.length-10,rows.length))
    }



  }
  catch(error){
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });

  }

})
app.post('/login',async (req, res) => {
  const { Email, Password } = req.body;
  try {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email=?", [Email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const user = rows[0];
    const isValidPassword = await bcrypt.compare(Password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    console.log("Login successful:", user); // Logging the user data retrieved from the database
    // res.redirect('/expenses/expense'); // Redirect to expense.html upon successful login
    res.send({ message: 'Login successfully', token: generateToken(user.id),name:user.name });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
}
);

app.post('/signup',async (req, res) => {
  const { Name, Email, Number,Password } = req.body;
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [Email]);
    if (rows.length > 0) {
      res.send("User already exists, Please Login")
   
    } else {
      const hashedpassword= await bcrypt.hash(Password,10)
      await pool.execute("INSERT INTO users (name, email,number, password) VALUES (?, ?, ?,?)", [Name, Email,Number, hashedpassword]);
      console.log(Name, Email, hashedpassword);
      res.send("Received successfully");
    
    }

  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
  }
});

app.get('/getgroup',async(req,res)=>{
  const token=req.header('Authorization')
  const id =jwt.verify(token,process.env.SECRET_KEY)
  try {
    const [rows] = await pool.execute('SELECT group_id FROM groupmember WHERE user_id = ?', [id.userid]);
    const arr=[]
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

})
app.get('/getalluserid',async(req,res)=>{
  const token=req.header('Authorization')
  const id =jwt.verify(token,process.env.SECRET_KEY)
  try {
    const [rows] = await pool.execute('SELECT id FROM users WHERE id != ?', [id.userid]);
    res.send(rows)
    
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
    
  }


})
app.post('/groupuser',async (req,res)=>{
  const {message,name,groupname}=req.body 
  const token=req.header('Authorization')
  const id= jwt.verify(token,process.env.SECRET_KEY)
  const date=new Date().toISOString()
  console.log(groupname,id.userid,name,message,date)
  try{
    await pool.execute('INSERT INTO groupmessage (groupname,user_id,username,groupmessage,time) VALUES(?,?,?,?,?)',[groupname,id.userid,name,message,date])
    const [rows]= await pool.execute('SELECT groupmessage,username FROM groupmessage WHERE groupname=?',[groupname])
    if (rows.length<10){
      res.status(201).json(rows)
    }
    else{
      res.status(201).json(rows.slice(rows.length-10,rows.length))
    }
    



  }
  catch(error){
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });

  }
})
app.get('/getgroupuser',async (req,res)=>{
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
    }



  }
  catch(error){
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });

  }

})
app.get('/isadmin', async (req, res) => {
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
});
app.post('/creategroup', async (req, res) => {
  const { groupname, selectedUserIds } = req.body;
  const token = req.header('Authorization');
  const id = jwt.verify(token, process.env.SECRET_KEY);
  const date = new Date().toISOString();

  try {
    // Insert group data into grouptable
    await pool.execute('INSERT INTO grouptable (group_name, admin, created_at) VALUES (?, ?, ?)',[groupname, id.userid, date]);

    // Get the group ID of the newly inserted group
    const [rows] = await pool.execute('SELECT group_id FROM grouptable');
    const group = rows[rows.length - 1].group_id;

    // Insert admin into groupmember table
    await pool.execute('INSERT INTO groupmember (group_id, user_id) VALUES (?, ?)',[group, id.userid]);

    // Insert selected users into groupmember table
    for (const val of selectedUserIds) {
      await pool.execute('INSERT INTO groupmember (group_id, user_id) VALUES (?, ?)',[group, val]);
    }

    res.status(200).send(group);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while creating the group");
  }
});
app.put('/editgroup', async (req, res) => {
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
});


app.listen(8000)