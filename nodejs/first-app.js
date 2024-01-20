const http = require('http');
const express =require("express");
const app=express();
app.use((req,res,next)=>{
  console.log("qwerty")
  next()

});
app.use((req,res,next)=>{
  console.log("wasd")
  res.send("<h1>hi tauseef here</h1>")
  

});

app.listen(4000);
