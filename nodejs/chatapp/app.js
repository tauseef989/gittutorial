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
app.post('/creategroup', async(req,res) =>{
  const {groupname}=req.body;
  const token=req.header('Authorization')
  const id= jwt.verify(token,process.env.SECRET_KEY)
  const date=new Date().toISOString()
  try{
    await pool.execute('INSERT INTO grouptable (group_name,admin,created_at) VALUES(?,?,?)',[groupname,id.userid,date])
    const [rows] = await pool.execute('SELECT group_id FROM grouptable')
    const group=rows[rows.length-1].group_id
    await pool.execute('INSERT INTO groupmember (group_id,user_id) VALUES(?,?)',[group,id.userid])
    res.send("group created successfully")

  }
  catch(error){
    console.error("Error:", error);
    res.status(500).send("Error occurred");
  }
})
app.get('/getgroup',async(req,res)=>{
  const token=req.header('Authorization')
  const id =jwt.verify(token,process.env.SECRET_KEY)
  try {
    const [rows] = await pool.execute('SELECT group_name FROM grouptable WHERE admin = ?', [id.userid]);
    res.send(rows)
    
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
    
  }

}
)

app.listen(8000)