// expenseModel.js
class ExpenseModel {
  constructor(pool) {
    this.pool = pool;
  }

  async addExpense(amount, description, category, userId) {
    await this.pool.execute('INSERT INTO expenses (amount, description, category, userid) VALUES (?, ?, ?, ?)', [amount, description, category, userId]);
  }

  async getExpensesByUserId(userId) {
    const [expenses] = await this.pool.execute('SELECT * FROM expenses WHERE userid=?', [userId]);
    return expenses;
  }

  async deleteExpenseById(expenseId) {
    await this.pool.execute('DELETE FROM expenses WHERE id = ?', [expenseId]);
  }
}

module.exports = ExpenseModel;
