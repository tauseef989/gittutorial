const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const secretKey = 'e314d73d2ee88c916172ee2b4a82b4a44f0c70db5bfe8c303a30607b8b59a462';
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI;
const dbName = 'expensetracker';
let db;

async function connectToMongoDB() {
  try {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(dbName); // Use the default database or specify the database name if needed
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

exports.getleaderboard = async (req, res) => {
  try {
    const leaderboard = await db.collection('users').find().sort({ total_expenses: -1 }).toArray();
    res.json(leaderboard);
  } catch (error) {
    console.error('An error occurred while fetching the leaderboard:', error);
    res.status(500).json({ error: 'An error occurred while fetching the leaderboard' });
  }
};
exports.getispremiummember = async (req, res) => {
  try {
    const token = req.header('Authorization');
    const { userid } = jwt.verify(token, secretKey);

    const order = await db.collection('orders').findOne({ user_id: userid, payment_id: { $exists: true, $ne: null } });
    if (order) {
      res.status(200).json({ key: true });
    } else {
      res.status(200).json({ key: false });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};


// exports.getispremiummember = async (req, res) => {
//   try {
//     const token = req.header('Authorization');
//     const { userid } = jwt.verify(token, secretKey);

//     const order = await db.collection('orders').findOne({ user_id: userid, payment_id: { $exists: true } });
//     if (order) {
//       res.status(200).json({ key: true });
//     } else {
//       res.status(200).json({ key: false });
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "An internal server error occurred" });
//   }
// };


