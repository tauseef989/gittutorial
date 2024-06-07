const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const secretKey = 'e314d73d2ee88c916172ee2b4a82b4a44f0c70db5bfe8c303a30607b8b59a462';
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI;
const dbName = 'expensetracker'; // Using environment variable or default to 'expensetracker'
let db;

async function connectToMongoDB() {
  try {
    const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(dbName); // Use the specified database name
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

exports.postnewpassword = async (req, res) => {
  const { password, uuid } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.collection('forgotpasswordrequest').updateOne({ _id: uuid }, { $set: { isactive: "NO" } });

    const request = await db.collection('forgotpasswordrequest').findOne({ _id: uuid });
    const userid = request.userid;

    await db.collection('users').updateOne({ _id: userid }, { $set: { password: hashedPassword } });

    console.log("updated successfully");
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

exports.getresetpassword = async (req, res) => {
  const id = req.params.id;

  try {
    const request = await db.collection('forgotpasswordrequest').findOne({ _id: id });

    if (request && request.isactive === "YES") {
      const token = generateToken(request.userid);
      res.sendFile(filePath);
    } else {
      console.log("Link is expired");
      res.status(400).json({ error: "Link is expired" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};

exports.getforgotpassword = async (req, res) => {
  const id = generateUUID();
  const { email } = req.query;

  try {
    const user = await db.collection('users').findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await db.collection('forgotpasswordrequest').insertOne({ _id: id, userid: user._id, isactive: "YES" });

    // Send email logic here

    res.status(200).json({ message: "Password reset email sent successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};
