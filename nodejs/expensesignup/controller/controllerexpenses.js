const express = require('express');// Import the Express module
const app = express();// Create an instance of the Express application
const router = express.Router(); // Import the Router module from Express

const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt=require("bcrypt")
const path = require('path');
const jwt=require("jsonwebtoken")
const crypto=require("crypto")
const Razorpay=require('razorpay');
const { connected } = require('process');
const secretKey ='e314d73d2ee88c916172ee2b4a82b4a44f0c70db5bfe8c303a30607b8b59a462'
require('dotenv').config();


const pool = mysql.createPool({
  user: 'root',
  database: 'expense',
  password: 'aA@11111',
  host: 'localhost'
});


app.use(cors());
app.use(bodyParser.json());

function generateToken(id){
  return jwt.sign({userid:id},secretKey)
}

// Endpoint to handle expense creation
exports.post = async (req, res) => {
  const token=req.header('Authorization')
  console.log('alpha',token)
  const userid=jwt.verify(token,secretKey)
  const { amount, description, category } = req.body;
  const connection=await pool.getConnection()
  const currentTime = new Date().toISOString();

  try {
    await connection.beginTransaction()
    // Insert expense into the database
    await pool.execute('INSERT INTO expenses (amount, description, category,userid,created_at) VALUES (?, ?, ?, ?, ?)', [amount, description, category,userid.userid,currentTime]);
    await pool.execute('UPDATE users SET total_expenses=total_expenses+? WHERE id=?',[amount,userid.userid])
    await connection.commit()
    res.status(201).json({ message: 'Expense added successfully' });
  } catch (error) {
    await connection.rollback()
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
}

// Endpoint to fetch all expense
exports.get=async (req, res) => {
  try {
    const {pn,noe}=req.query
    console.log(pn,noe)
    const start_index = (parseInt(pn) - 1) * parseInt(noe);
    const last_index = start_index + parseInt(noe);
    console.log(start_index,last_index)
    const token=req.header('Authorization')
    console.log('beta',token)
    const userid=jwt.verify(token,secretKey)
    console.log(userid)
    // Fetch all expenses from the database
    const [expenses] = await pool.execute('SELECT * FROM expenses WHERE userid=?',[userid.userid]);
    const limit=Math.ceil(expenses.length/parseInt(noe))
    // console.log(expenses.slice(start_index,last_index))
    res.json({expenses:expenses.slice(start_index,last_index),limit:limit});
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
}

// Endpoint to delete an expense by ID
exports.delete= async (req, res) => {
  const { id } = req.params;
  const token=req.header('Authorization')
  console.log('beta',token)
  const userid=jwt.verify(token,secretKey)
  const connection=await pool.getConnection()

  try {
    await connection.beginTransaction()
    // Delete expense from the database
    const [expense] = await pool.execute('SELECT amount FROM expenses WHERE id = ?', [id]);
    const amount = expense[0].amount;
    await pool.execute('UPDATE users SET total_expenses = total_expenses - ? WHERE id = ?', [amount, userid.userid]);
    await pool.execute('DELETE FROM expenses WHERE id = ?', [id]);
    
    await connection.commit()
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    await connection.rollback()
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }finally {
    connection.release(); // Release the connection back to the pool
  }

};

