const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const jwt = require('jsonwebtoken');
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

exports.postsignup = async (req, res) => {
  const { Name, Email, Password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(Password, 10);
    await db.collection('users').insertOne({ name: Name, email: Email, password: hashedPassword });
    console.log(`${Name}, ${Email}, ${hashedPassword}`);
    res.send('Received successfully');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error occurred');
  }
};
