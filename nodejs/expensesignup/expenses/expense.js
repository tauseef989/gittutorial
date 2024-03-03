const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = 8000;

app.use(cors());

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'expensetracker', // Change the database name if needed
  password: 'aA@11111' // Change the password
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});