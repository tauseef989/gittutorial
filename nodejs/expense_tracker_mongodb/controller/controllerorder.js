// const express = require('express');// Import the Express module
// const app = express();// Create an instance of the Express application
// const router = express.Router(); // Import the Router module from Express


// const bodyParser = require("body-parser");
// const cors = require("cors");
// const mysql = require("mysql2/promise");
// const bcrypt=require("bcrypt")
// const path = require('path');
// const jwt=require("jsonwebtoken")
// const crypto=require("crypto")
// const Razorpay=require('razorpay')
// const secretKey ='e314d73d2ee88c916172ee2b4a82b4a44f0c70db5bfe8c303a30607b8b59a462'
// require('dotenv').config();




// const pool = mysql.createPool({
//   user: process.env.DB_USER,
//   database: process.env.DB_DATABASE,
//   password: process.env.DB_PASSWORD,
//   host: process.env.DB_HOST
// });


// app.use(cors());
// app.use(bodyParser.json());

// function generateToken(id){
//   return jwt.sign({userid:id},secretKey)
// }




// exports.post=async (req, res) => {
//   console.log("apple")
//   try {
//     console.log("apple")
//     const { order_id, payment_id } = req.body;
    
//     // Get a connection from the pool
//     const connection = await pool.getConnection();
//     // Begin the transaction
//     await connection.beginTransaction();
//     try {  
//       // Update the transaction status in the database
//       await connection.execute("UPDATE orders SET status = 'COMPLETED' WHERE order_id = ?", [order_id]);
//       await connection.execute("UPDATE orders SET payment_id = ? WHERE order_id = ?", [payment_id, order_id]);

//       // Commit the transaction
//       await connection.commit();

//       // Release the connection back to the pool
//       connection.release();

//       // Return a success message
//       res.json({ message: "Transaction status updated successfully" });
//     } catch (error) {
//       // Rollback the transaction in case of an error
//       await connection.rollback();
//       console.error("Error updating transaction status:", error);
//       res.status(500).json({ error: "Failed to update transaction status" });
//     } finally {
//       // Ensure to release the connection in case of any error
//       if (connection) {
//         connection.release();
//       }
//     }
//   } catch (error) {
//     console.error("Error establishing database connection:", error);
//     res.status(500).json({ error: "Database connection error" });
//   }
// }

// exports.get = async (req, res) => {
//   const token=req.header('Authorization')
//   // console.log('premiummembership',token)
//   const userid=jwt.verify(token,secretKey)
//   // console.log(userid)
//   try {
//     const rzp = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET
//     });

//     const amount = 2500;

//     // Create a new order using async/await
//     const order = await new Promise((resolve, reject) => {
//       rzp.orders.create({ amount, currency: 'INR' }, (err, order) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(order);
//         }
//       });
//     });

//     await pool.execute('INSERT INTO orders(order_id, status, user_id) VALUES (?, ?, ?)', [order.id, 'PENDING', userid.userid]);

//     // Return the response
//     console.log("getsucessfull-123")
//     res.status(201).json({ order, key_id: rzp.key_id });
//   } catch (err) {
//     console.error(err);
//     res.status(403).json({ message: 'Something went wrong', error: err });
//   }
// }

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
require('dotenv').config();

const { MongoClient } = require('mongodb');
const mongoUri = process.env.MONGODB_URI;
let db;

async function connectToMongoDB() {
  try {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(); // Use the default database or specify the database name if needed
    console.log('Connected successfully to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

connectToMongoDB();

// Endpoint to handle updating transaction status
router.post('/', async (req, res) => {
  const token = req.header('Authorization');
  const { userid } = jwt.verify(token, secretKey);
  const { order_id, payment_id } = req.body;

  try {
    // Update transaction status in MongoDB
    await db.collection('orders').updateOne({ order_id }, { $set: { status: 'COMPLETED', payment_id } });

    res.json({ message: 'Transaction status updated successfully' });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(500).json({ error: 'Failed to update transaction status' });
  }
});

// Endpoint to create a new order
router.get('/', async (req, res) => {
  const token = req.header('Authorization');
  const { userid } = jwt.verify(token, secretKey);

  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const amount = 2500;

    // Create a new order using Razorpay
    const order = await new Promise((resolve, reject) => {
      rzp.orders.create({ amount, currency: 'INR' }, (err, order) => {
        if (err) {
          reject(err);
        } else {
          resolve(order);
        }
      });
    });

    // Insert order into MongoDB
    await db.collection('orders').insertOne({ order_id: order.id, status: 'PENDING', user_id: userid });

    res.status(201).json({ order, key_id: rzp.key_id });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(403).json({ message: 'Something went wrong', error });
  }
});

module.exports = router;


