const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const Razorpay = require('razorpay');
const secretKey ='e314d73d2ee88c916172ee2b4a82b4a44f0c70db5bfe8c303a30607b8b59a462';
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI;
const dbName = "expensetracker";
let db;

async function connectToMongoDB() {
  try {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(dbName); 
    // console.log('Connected successfully to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

connectToMongoDB();

// Generate JWT Token
function generateToken(id) {
  return jwt.sign({ userid: id }, secretKey);
}

// exports.post = async (req, res) => {
//   try {
//     const { order_id, payment_id } = req.body;
//     console.log(order_id,payment_id)
//     const session = db.client.startSession();
//     session.startTransaction();

//     try {
//       const ordersCollection = db.collection('orders');
//       await ordersCollection.updateOne({ order_id: order_id }, { $set: { status: 'COMPLETED', payment_id: payment_id } }, { session });

//       await session.commitTransaction();
//       session.endSession();

//       res.json({ message: "Transaction status updated successfully" });
//     } catch (error) {
//       await session.abortTransaction();
//       session.endSession();

//       console.error("Error updating transaction status:", error);
//       res.status(500).json({ error: "Failed to update transaction status" });
//     }
//   } catch (error) {
//     console.error("Error establishing database connection:", error);
//     res.status(500).json({ error: "Database connection error" });
//   }
// };
exports.post = async (req, res) => {
  try {
    const { order_id, payment_id } = req.body;
    console.log(order_id, payment_id);

    const ordersCollection = db.collection('orders');

    try {
      await ordersCollection.updateOne(
        { order_id: order_id },
        { $set: { status: 'COMPLETED', payment_id: payment_id } }
      );

      res.json({ message: "Transaction status updated successfully" });
    } catch (error) {
      console.error("Error updating transaction status:", error);
      res.status(500).json({ error: "Failed to update transaction status" });
    }
  } catch (error) {
    console.error("Error establishing database connection:", error);
    res.status(500).json({ error: "Database connection error" });
  }
};


exports.get = async (req, res) => {
  const token = req.header('Authorization');
  const userid = jwt.verify(token, secretKey);

  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const amount = 2500;

    const order = await new Promise((resolve, reject) => {
      rzp.orders.create({ amount, currency: 'INR' }, (err, order) => {
        if (err) {
          reject(err);
        } else {
          
          resolve(order);
        }
      });
    });
    
    const ordersCollection = db.collection('orders');
    order.payment_id = null;
    await ordersCollection.insertOne({ order_id: order.id, status: 'PENDING', user_id: userid.userid,payment_id: order.payment_id });

    res.status(201).json({ order, key_id: rzp.key_id });
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: 'Something went wrong', error: err });
  }
};
