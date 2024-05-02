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

=======
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
>>>>>>> 0131f798d4dae90476558b2e40c3ecf0608ecc98

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
<<<<<<< HEAD
app.use(loginrouter);
app.use(signuprouter);
app.use(grouprouter);
app.use(filemessage);
=======

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
    }}




  
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
// Handle file uploads
app.post('/sendMessageWithFile', upload.single('file'), async (req, res) => {
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
});




server.listen(8000,()=>{console.log('running on 8000')})