// userController.js
const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const mysql=require('mysql2/promise')

const pool = mysql.createPool({
  user: 'root',
  database: 'expense',
  password: 'aA@11111',
  host: 'localhost'
});

const userModel = new UserModel(pool);

exports.login = async (req, res) => {
  const { Email, Password } = req.body;
  try {
    const user = await userModel.getUserByEmail(Email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isValidPassword = await bcrypt.compare(Password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    console.log("Login successful:", user);
    const token = generateToken(user.id);
    res.json({ message: 'Login successfully', token });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

exports.signup = async (req, res) => {
  const { Name, Email, Password } = req.body;
  try {
    await userModel.createUser(Name, Email, Password);
    console.log(Name, Email, Password);
    res.send("Received successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
  }
};
