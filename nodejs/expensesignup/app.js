const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt=require("bcrypt")
const path = require('path');

const app = express();
const pool = mysql.createPool({
  user: 'root',
  database: 'expense',
  password: 'aA@11111',
  host: 'localhost'
});

app.use(cors());
app.use(bodyParser.json());

// Serve login.html from the specified directory
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'expensesignup', 'expenses', 'login.html'));
});

app.post("/login", async (req, res) => {
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
    res.send("login successfully")
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});




app.post("/signup", async (req, res) => {
  const { Name, Email, Password } = req.body;
  try {
    const hashedpassword= await bcrypt.hash(Password,10)
    await pool.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [Name, Email, hashedpassword]);
    console.log(Name, Email, hashedpassword);
    res.send("Received successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
  }
});


// Endpoint to handle expense creation
app.post('/expenses', async (req, res) => {
  const { amount, description, category } = req.body;

  try {
    // Insert expense into the database
    await pool.execute('INSERT INTO expenses (amount, description, category) VALUES (?, ?, ?)', [amount, description, category]);
    res.status(201).json({ message: 'Expense added successfully' });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Endpoint to fetch all expenses
app.get('/expenses', async (req, res) => {
  try {
    // Fetch all expenses from the database
    const [expenses] = await pool.execute('SELECT * FROM expenses');
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Endpoint to delete an expense by ID
app.delete('/expenses/:id', async (req, res) => {
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


app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
