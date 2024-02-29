const express=require("express");
const bodyParser=require("body-parser");
const cors=require("cors");

const app=express();

app.use(cors());
app.use(bodyParser.json());

app.post("/submit",(req,res)=>{ // Changed route to handle POST requests
  const details=req.body;
  console.log(details);
  res.send("Received successfully"); // Send response back to frontend
});

app.listen(8000);
