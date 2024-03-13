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
const Razorpay=require('razorpay')
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
router.post('/', async (req, res) => {
  const token=req.header('Authorization')
  console.log('alpha',token)
  const userid=jwt.verify(token,secretKey)
  const { amount, description, category } = req.body;

  try {
    // Insert expense into the database
    await pool.execute('INSERT INTO expenses (amount, description, category,userid) VALUES (?, ?, ?, ?)', [amount, description, category,userid.userid]);
    await pool.execute('UPDATE users SET total_expenses=total_expenses+? WHERE id=?',[amount,userid.userid])
    res.status(201).json({ message: 'Expense added successfully' });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Endpoint to fetch all expense
router.get('/', async (req, res) => {
  try {
    const token=req.header('Authorization')
    console.log('beta',token)
    const userid=jwt.verify(token,secretKey)
    console.log(userid)
    // Fetch all expenses from the database
    const [expenses] = await pool.execute('SELECT * FROM expenses WHERE userid=?',[userid.userid]);
    console.log(expenses)
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Endpoint to delete an expense by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete expense from the database
    await pool.execute('DELETE FROM expenses WHERE id = ?', [id]);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports=router