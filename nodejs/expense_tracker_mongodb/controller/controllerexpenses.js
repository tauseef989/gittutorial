const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { MongoClient, ObjectId } = require('mongodb');
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

exports.post = async (req, res) => {
  const token = req.header('Authorization');
  const userid = jwt.verify(token, secretKey).userid;
  const { amount, description, category } = req.body;
  const amountNumeric = parseFloat(amount);

  const currentTime = new Date().toISOString();

  try {
    // Insert expense into the database
    await db.collection('expenses').insertOne({ amount, description, category, userid, created_at: currentTime });
    await db.collection('users').updateOne({ _id: new ObjectId(userid) }, { $inc: { total_expenses: amountNumeric } });
    
    res.status(201).json({ message: 'Expense added successfully' });
  } catch (error) {
  
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
};

exports.get = async (req, res) => {
  const token = req.header('Authorization');
  const userid = jwt.verify(token, secretKey).userid;
  const { pn, noe } = req.query;
  const start_index = (parseInt(pn) - 1) * parseInt(noe);
  const last_index = start_index + parseInt(noe);

  try {
    // Fetch all expenses from the database
    const expenses = await db.collection('expenses').find({ userid }).toArray();
    const limit = Math.ceil(expenses.length / parseInt(noe));
    res.json({ expenses: expenses.slice(start_index, last_index), limit });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};




exports.delete = async (req, res) => {
  const { id } = req.params;
  const token = req.header('Authorization');
  const userid = jwt.verify(token, secretKey).userid;

  try {
    // Validate id format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid expense ID format' });
    }

    // Delete expense from the database
    const expense = await db.collection('expenses').findOne({ _id: new ObjectId(id) });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const amount = expense.amount;
    await db.collection('users').updateOne({ _id: new ObjectId(userid) }, { $inc: { total_expenses: -amount } });
    await db.collection('expenses').deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};
