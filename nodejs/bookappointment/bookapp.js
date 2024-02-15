// backend/bookapp.js

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const PORT = 8000;
app.use(cors());
// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'bookings', // Change the database name if needed
  password: 'aA@11111' // Change the password
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());

app.post('/book', async (req, res) => {
  const { name, email, phone, date, time } = req.body;

  try {
    // Insert appointment into the database
    const [result] = await pool.execute('INSERT INTO appointments (name, email, phone, date, time) VALUES (?, ?, ?, ?, ?)', [name, email, phone, date, time]);

    // Get the inserted appointment data from the database
    const [appointment] = await pool.execute('SELECT * FROM appointments WHERE id = ?', [result.insertId]);

    // Send success response with the appointment data
    res.status(201).json({ message: 'Appointment booked successfully', appointment: appointment[0] });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
