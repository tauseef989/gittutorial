// expenseController.js
const ExpenseModel = require('../models/expenseModel');

const pool = mysql.createPool({
  user: 'root',
  database: 'expense',
  password: 'aA@11111',
  host: 'localhost'
});

const expenseModel = new ExpenseModel(pool);

exports.addExpense = async (req, res) => {
  const { amount, description, category } = req.body;
  const userId = req.user.id; // Assuming user information is stored in req.user after authentication
  try {
    await expenseModel.addExpense(amount, description, category, userId);
    res.status(201).json({ message: 'Expense added successfully' });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
};

exports.getExpenses = async (req, res) => {
  const userId = req.user.id; // Assuming user information is stored in req.user after authentication
  try {
    const expenses = await expenseModel.getExpensesByUserId(userId);
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  try {
    await expenseModel.deleteExpenseById(id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};
