const mysql = require('mysql');
const CronJob = require('cron').CronJob;

// Create MySQL connection pool
const pool = mysql.createPool({
  user: 'root',
  database: 'chatapp',
  password: 'aA@11111',
  host: 'localhost'
});

// Function to move old messages to ArchivedGroupMessage table
function moveOldMessages() {
  // Calculate cutoff timestamp (1 day ago)
  const cutoffTimestamp = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

  // Select old messages from GroupMessage table
  const selectQuery = `SELECT * FROM GroupMessage WHERE time < '${cutoffTimestamp}'`;
  pool.query(selectQuery, (err, oldMessages) => {
    if (err) {
      console.error('Error selecting old messages: ', err);
      return;
    }
    
    // Insert old messages into ArchivedGroupMessage table
    const insertQuery = 'INSERT INTO ArchivedGroupMessage (idgroupmessage, groupname, user_id, username, groupmessage, time) VALUES ?';
    const values = oldMessages.map(message => [message.idgroupmessage, message.groupname, message.user_id, message.username, message.groupmessage, message.time]);
    pool.query(insertQuery, [values], (err) => {
      if (err) {
        console.error('Error inserting old messages into ArchivedGroupMessage: ', err);
        return;
      }
      
      // Delete old messages from GroupMessage table
      const deleteQuery = `DELETE FROM GroupMessage WHERE time < '${cutoffTimestamp}'`;
      pool.query(deleteQuery, (err) => {
        if (err) {
          console.error('Error deleting old messages from GroupMessage: ', err);
          return;
        }
        
        console.log('Old messages moved to ArchivedGroupMessage and deleted from GroupMessage');
      });
    });
  });
}

// Define cron job to run moveOldMessages() function nightly at midnight
const nightlyJob = new CronJob('0 0 * * *', moveOldMessages);

// Start the cron job
nightlyJob.start();
