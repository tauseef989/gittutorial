const path=require('path')
const express=require('express')
const fs=require('fs')
const app=express()
const mysql=require('mysql2/promise')
const pool=mysql.createPool({
  host:'localhost',
  user:'root',
  database:'book-appointment',
  password:'aA@11111'
})
pool.execute('SELECT * FROM appointments')
  .then(([rows, fields]) => {
    console.log(rows); 
  })
  .catch(error => {
    console.error('Error executing query:', error);
  });
const htmlFilePath = path.join(__dirname, 'bookappoint.html');
const bodyParser=require("body-parser");
const { writeFileSync } = require('fs');
app.use(bodyParser.urlencoded({extended: false}));
app.get('/book',(req,res)=>{
  res.sendFile(htmlFilePath)
}
)
app.post('/book',(req,res)=>{
  pool.execute('INSERT INTO appointments (name,email,phone,date,time) VALUES(?,?,?,?,?)',[req.body.name,req.body.email,req.body.phone,req.body.date,req.body.time])
  .then(() => {
    // Fetch all appointments from the database
    return pool.execute('SELECT * FROM appointments');
  })
  .then(([appointments]) => {
    // Send the list of appointments as JSON
    res.json(appointments);
  })

  // let bookapp=[]
  // bookapp =JSON.parse(fs.readFileSync('bookapp.txt','utf8'))

  // if (req.body){
    
  //   bookapp.push(req.body)

  // }
  // fs.writeFileSync('bookapp.txt',JSON.stringify(bookapp) + '\n')
  // console.log(bookapp)


  
  
})

app.listen(8000,()=>{
  console.log('server is running on 8000')
})
