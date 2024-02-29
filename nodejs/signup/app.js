const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const pool = mysql.createPool({
  user: 'root',
  database: 'expense',
  password: 'aA@11111',
  host: 'localhost'
});

app.use(cors());
app.use(bodyParser.json());

app.post("/submit", async (req, res) => {
  const { Name, Email, Password } = req.body;
  try {
    await pool.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [Name, Email, Password]);
    console.log(Name, Email, Password);
    res.send("Received successfully");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error occurred");
  }
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
