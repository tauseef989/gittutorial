// userModel.js
const mysql = require("mysql2/promise");

class UserModel {
  constructor(pool) {
    this.pool = pool;
  }

  async getUserByEmail(email) {
    const [rows] = await this.pool.execute("SELECT * FROM users WHERE email=?", [email]);
    return rows[0];
  }

  async createUser(name, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.pool.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);
  }
}

module.exports = UserModel;
