require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt=require("bcrypt")
const path = require('path');
const jwt=require("jsonwebtoken")
const crypto=require("crypto")
const Razorpay=require('razorpay')
const secretKey ='e314d73d2ee88c916172ee2b4a82b4a44f0c70db5bfe8c303a30607b8b59a462'
const PORT = process.env.PORT || 8000;
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

const orderrouter=require("./router/orders")
const expensesrouter=require("./router/expenses")
const signuprouter=require("./router/signup")
const loginrouter=require('./router/login')
const premiumrouter=require('./router/premium')


const app = express();
const pool = mysql.createPool({
  user: 'root',
  database: 'expense',
  password: 'aA@11111',
  host: 'localhost'
});


app.use(cors());
app.use(bodyParser.json());

function generateToken(id){
  return jwt.sign({userid:id},secretKey)
}

app.use('/purchase',orderrouter)
app.use('/expenses', expensesrouter)
app.use(signuprouter)
app.use(loginrouter)
app.use('/premium',premiumrouter)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// app.get('/leaderboard', async (req, res) => {
//   try {
//     const [rows] = await pool.execute(`
//       SELECT u.name, COALESCE(SUM(e.amount), 0) AS total_amount
//       FROM users u
//       LEFT JOIN expenses e ON u.id = e.userid
//       GROUP BY u.id, u.name
//       ORDER BY total_amount DESC
//     `);
//     res.json(rows);
//   } catch (error) {
//     console.error('An error occurred:', error);
//     res.status(500).json({ error: 'An error occurred while fetching the leaderboard' });
//   }
// });









// app.post("/purchase/updatetransactionstatus", async (req, res) => {
//   console.log("apple")
//   try {
//     console.log("apple")
//     const { order_id, payment_id } = req.body;
    
//     // Get a connection from the pool
//     const connection = await pool.getConnection();
//     // Begin the transaction
//     await connection.beginTransaction();
//     try {  
//       // Update the transaction status in the database
//       await connection.execute("UPDATE orders SET status = 'COMPLETED' WHERE order_id = ?", [order_id]);
//       await connection.execute("UPDATE orders SET payment_id = ? WHERE order_id = ?", [payment_id, order_id]);

//       // Commit the transaction
//       await connection.commit();

//       // Release the connection back to the pool
//       connection.release();

//       // Return a success message
//       res.json({ message: "Transaction status updated successfully" });
//     } catch (error) {
//       // Rollback the transaction in case of an error
//       await connection.rollback();
//       console.error("Error updating transaction status:", error);
//       res.status(500).json({ error: "Failed to update transaction status" });
//     } finally {
//       // Ensure to release the connection in case of any error
//       if (connection) {
//         connection.release();
//       }
//     }
//   } catch (error) {
//     console.error("Error establishing database connection:", error);
//     res.status(500).json({ error: "Database connection error" });
//   }
// });


// app.get("/purchase/premiummembership", async (req, res) => {
//   const token=req.header('Authorization')
//   // console.log('premiummembership',token)
//   const userid=jwt.verify(token,secretKey)
//   // console.log(userid)
//   try {
//     const rzp = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET
//     });

//     const amount = 2500;

//     // Create a new order using async/await
//     const order = await new Promise((resolve, reject) => {
//       rzp.orders.create({ amount, currency: 'INR' }, (err, order) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(order);
//         }
//       });
//     });

//     await pool.execute('INSERT INTO orders(order_id, status, user_id) VALUES (?, ?, ?)', [order.id, 'PENDING', userid.userid]);

//     // Return the response
//     console.log("getsucessfull-123")
//     res.status(201).json({ order, key_id: rzp.key_id });
//   } catch (err) {
//     console.error(err);
//     res.status(403).json({ message: 'Something went wrong', error: err });
//   }
// });



// app.post("/login", async (req, res) => {
//   const { Email, Password } = req.body;
//   try {
//     const [rows] = await pool.execute("SELECT * FROM users WHERE email=?", [Email]);
//     if (rows.length === 0) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }
//     const user = rows[0];
//     const isValidPassword = await bcrypt.compare(Password, user.password);
//     if (!isValidPassword) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }
//     console.log("Login successful:", user); // Logging the user data retrieved from the database
//     // res.redirect('/expenses/expense'); // Redirect to expense.html upon successful login
//     res.send({ message: 'Login successfully', token: generateToken(user.id) });

//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "An internal server error occurred" });
//   }
// });


// app.post("/signup", async (req, res) => {
//   const { Name, Email, Password } = req.body;
//   try {
//     const hashedpassword= await bcrypt.hash(Password,10)
//     await pool.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [Name, Email, hashedpassword]);
//     console.log(Name, Email, hashedpassword);
//     res.send("Received successfully");
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).send("Error occurred");
//   }
// });


// Endpoint to handle expense creation
// app.post('/expenses', async (req, res) => {
//   const token=req.header('Authorization')
//   console.log('alpha',token)
//   const userid=jwt.verify(token,secretKey)
//   const { amount, description, category } = req.body;

//   try {
//     // Insert expense into the database
//     await pool.execute('INSERT INTO expenses (amount, description, category,userid) VALUES (?, ?, ?, ?)', [amount, description, category,userid.userid]);
//     res.status(201).json({ message: 'Expense added successfully' });
//   } catch (error) {
//     console.error('Error adding expense:', error);
//     res.status(500).json({ error: 'Failed to add expense' });
//   }
// });


// Endpoint to fetch all expense
// app.get('/expenses', async (req, res) => {
//   try {
//     const token=req.header('Authorization')
//     console.log('beta',token)
//     const userid=jwt.verify(token,secretKey)
//     console.log(userid)
//     // Fetch all expenses from the database
//     const [expenses] = await pool.execute('SELECT * FROM expenses WHERE userid=?',[userid.userid]);
//     console.log(expenses)
//     res.json(expenses);
//   } catch (error) {
//     console.error('Error fetching expenses:', error);
//     res.status(500).json({ error: 'Failed to fetch expenses' });
//   }
// });


// Endpoint to delete an expense by ID
// app.delete('/expenses/:id', async (req, res) => {
//   const { id } = req.params;

//   try {
//     // Delete expense from the database
//     await pool.execute('DELETE FROM expenses WHERE id = ?', [id]);
//     res.json({ message: 'Expense deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting expense:', error);
//     res.status(500).json({ error: 'Failed to delete expense' });
//   }
// });