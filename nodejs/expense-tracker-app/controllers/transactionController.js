// transactionController.js
const TransactionModel = require('../models/transactionModel');
const mysql=require('mysql2/promise')
const pool = mysql.createPool({
  user: 'root',
  database: 'expense',
  password: 'aA@11111',
  host: 'localhost'
});

const transactionModel = new TransactionModel(pool);

exports.updateTransactionStatus = async (req, res) => {
  const { order_id, payment_id } = req.body;
  try {
    await transactionModel.updateTransactionStatus(order_id, payment_id);
    res.json({ message: "Transaction status updated successfully" });
  } catch (error) {
    console.error("Error updating transaction status:", error);
    res.status(500).json({ error: "Failed to update transaction status" });
  }
};

exports.getPremiumMembership = async (req, res) => {
  // Implement logic for getting premium membership using Razorpay
};
