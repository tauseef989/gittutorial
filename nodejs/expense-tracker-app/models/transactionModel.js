// transactionModel.js
class TransactionModel {
  constructor(pool) {
    this.pool = pool;
  }

  async updateTransactionStatus(orderId, paymentId) {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();

    try {
      await connection.execute("UPDATE orders SET status = 'COMPLETED' WHERE order_id = ?", [orderId]);
      await connection.execute("UPDATE orders SET payment_id = ? WHERE order_id = ?", [paymentId, orderId]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = TransactionModel;
