// services/transactionService.js

const pool = require('../config').pool;

async function updateTransactionStatus(order_id, payment_id) {
  await pool.execute("UPDATE orders SET status = 'COMPLETED' WHERE order_id = ?", [order_id]);
  await pool.execute("UPDATE orders SET payment_id = ? WHERE order_id = ?", [payment_id, order_id]);
}

module.exports = {
  updateTransactionStatus
};
