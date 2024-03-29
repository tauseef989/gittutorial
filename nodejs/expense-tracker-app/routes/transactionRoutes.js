// transactionRoutes.js
const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');

router.post('/purchase/updatetransactionstatus', TransactionController.updateTransactionStatus);
router.get('/purchase/premiummembership', TransactionController.getPremiumMembership);

module.exports = router;
