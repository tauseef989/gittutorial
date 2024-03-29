// services/expenseService.js

const pool = require('../config').pool;

async function fetchExpenses() {
  const [expenses] = await pool.execute('SELECT * FROM expenses');
  return expenses;
}

async function addExpense(amount, description, category) {
  await pool.execute('INSERT INTO expenses (amount, description, category) VALUES (?, ?, ?)', [amount, description, category]);
}

async function deleteExpense(id) {
  await pool.execute('DELETE FROM expenses WHERE id = ?', [id]);
}

module.exports = {
  fetchExpenses,
  addExpense,
  deleteExpense
};
