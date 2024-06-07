require('dotenv').config();
const express = require("express");
const fs = require('fs');
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');

const orderrouter = require("./router/orders");
const expensesrouter = require("./router/expenses");
const signuprouter = require("./router/signup");
const loginrouter = require('./router/login');
const premiumrouter = require('./router/premium');
const passwordrouter = require('./router/password');
const downloadrouter = require('./router/download');


const app = express();
const PORT = process.env.PORT;
const accesslogstream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(helmet());
app.use(morgan('combined', { stream: accesslogstream }));
app.use(cors());
app.use(bodyParser.json());


app.use(downloadrouter);
app.use('/purchase', orderrouter);
app.use('/expenses', expensesrouter);
app.use(signuprouter);
app.use(loginrouter);
app.use('/premium', premiumrouter);
app.use('/password', passwordrouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
