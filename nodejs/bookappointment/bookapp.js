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

// Endpoint to handle appointment booking
app.post('/book', async (req, res) => {
  const { name, email, phone, date, time } = req.body;

  try {
    // Insert appointment into the database
    const [result] = await pool.execute('INSERT INTO appointments (name, email, phone, date, time) VALUES (?, ?, ?, ?, ?)', [name, email, phone, date, time]);

    // Send success response
    res.status(201).json({ message: 'Appointment booked successfully', appointmentId: result.insertId });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// Endpoint to fetch all appointments
app.get('/appointments', async (req, res) => {
  try {
    // Fetch all appointments from the database
    const [appointments] = await pool.execute('SELECT * FROM appointments');
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Endpoint to delete an appointment by ID
app.delete('/appointments/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete appointment from the database
    await pool.execute('DELETE FROM appointments WHERE id = ?', [id]);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
