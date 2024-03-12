const express = require('express');// Import the Express module
const app = express();// Create an instance of the Express application
const router = express.Router(); // Import the Router module from Express


const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt=require("bcrypt")
const path = require('path');
const jwt=require("jsonwebtoken")
const crypto=require("crypto")
const Razorpay=require('razorpay')
const secretKey ='e314d73d2ee88c916172ee2b4a82b4a44f0c70db5bfe8c303a30607b8b59a462'
require('dotenv').config();




const pool = mysql.createPool({
  user: 'root',
  database: 'expense',
  password: 'aA@11111',
  host: 'localhost'
});


app.use(cors());
app.use(bodyParser.json());

function generateToken(id){
  return jwt.sign({userid:id},secretKey)
}




router.post("/updatetransactionstatus", async (req, res) => {
  console.log("apple")
  try {
    console.log("apple")
    const { order_id, payment_id } = req.body;
    
    // Get a connection from the pool
    const connection = await pool.getConnection();
    // Begin the transaction
    await connection.beginTransaction();
    try {  
      // Update the transaction status in the database
      await connection.execute("UPDATE orders SET status = 'COMPLETED' WHERE order_id = ?", [order_id]);
      await connection.execute("UPDATE orders SET payment_id = ? WHERE order_id = ?", [payment_id, order_id]);

      // Commit the transaction
      await connection.commit();

      // Release the connection back to the pool
      connection.release();

      // Return a success message
      res.json({ message: "Transaction status updated successfully" });
    } catch (error) {
      // Rollback the transaction in case of an error
      await connection.rollback();
      console.error("Error updating transaction status:", error);
      res.status(500).json({ error: "Failed to update transaction status" });
    } finally {
      // Ensure to release the connection in case of any error
      if (connection) {
        connection.release();
      }
    }
  } catch (error) {
    console.error("Error establishing database connection:", error);
    res.status(500).json({ error: "Database connection error" });
  }
});

router.get("/premiummembership", async (req, res) => {
  const token=req.header('Authorization')
  // console.log('premiummembership',token)
  const userid=jwt.verify(token,secretKey)
  // console.log(userid)
  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const amount = 2500;

    // Create a new order using async/await
    const order = await new Promise((resolve, reject) => {
      rzp.orders.create({ amount, currency: 'INR' }, (err, order) => {
        if (err) {
          reject(err);
        } else {
          resolve(order);
        }
      });
    });

    await pool.execute('INSERT INTO orders(order_id, status, user_id) VALUES (?, ?, ?)', [order.id, 'PENDING', userid.userid]);

    // Return the response
    console.log("getsucessfull-123")
    res.status(201).json({ order, key_id: rzp.key_id });
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: 'Something went wrong', error: err });
  }
});

module.exports=router;