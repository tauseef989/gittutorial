const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'cricketers',
  password: 'aA@11111',
});

// Endpoint to add a player to the database
app.post('/players', async (req, res) => {
  const { name, DOB, photo, birthplace, career, fifties, centuries, wickets, average } = req.body;

  try {
    // Update player information in the database
    await pool.execute('UPDATE players SET Name = ?, DateOfBirth = ?, PhotoUrl = ?, Birthplace = ?, Career = ?, Fifties = ?, Centuries = ?, Wickets = ?, Average = ? WHERE Name = ?', [name, DOB, photo, birthplace, career, fifties, centuries, wickets, average, playerName]);
    // Send success response
    res.status(201).json({ message: 'Player added successfully' });
  } catch (error) {
    console.error('Error adding player:', error);
    res.status(500).json({ error: 'Failed to add player' });
  }
});

// Endpoint to search for a player by name
app.get('/players/:name', async (req, res) => {
  const playerName = req.params.name;

  try {
    // Query the database to retrieve player information by name
    const [rows] = await pool.query('SELECT * FROM players WHERE name = ?', [playerName]);

    // Check if player information was found
    if (rows.length > 0) {
      // Send the player information as a response
      res.status(200).json(rows[0]); // Assuming you only expect one player per name
    } else {
      // If player not found, send a 404 Not Found response
      res.status(404).json({ error: 'Player not found' });
    }
  } catch (error) {
    console.error('Error searching for player:', error);
    res.status(500).json({ error: 'Failed to search for player' });
  }
});

// Endpoint to update player information by name
app.put('/players/:name', async (req, res) => {
  const playerName = req.params.name;
  const { DOB, photo, birthplace, career, fifties, centuries, wickets, average } = req.body;

  try {
    // Update player information in the database
    await pool.execute('UPDATE players SET DateOfBirth = ?, PhotoUrl = ?, Birthplace = ?, Career = ?, Fifties = ?, Centuries = ?, Wickets = ?, Average = ? WHERE Name = ?', [DOB, photo, birthplace, career, fifties, centuries, wickets, average, playerName]);

    // Send success response
    res.status(200).json({ message: 'Player updated successfully' });
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
