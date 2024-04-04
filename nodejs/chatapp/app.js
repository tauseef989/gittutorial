const express=require('express')
require('dotenv').config();
const express = require("express");
const fs=require('fs')
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt=require("bcrypt")
const app=express()
const pool = mysql.createPool({
  user: 'root',
  database: 'chatapp',
  password: 'aA@11111',
  host: 'localhost'
});


app.use(cors());
app.use(bodyParser.json());

app.post('/signup',async (req, res) => {
  const { Name, Email, Number,Password } = req.body;
  try {
    const hashedpassword= await bcrypt.hash(Password,10)
    await pool.execute("INSERT INTO users (name, email,number, password) VALUES (?, ?, ?,?)", [Name, Email,Number, hashedpassword]);
    console.log(Name, Email, hashedpassword);
    res.send("Received successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
  }
};)