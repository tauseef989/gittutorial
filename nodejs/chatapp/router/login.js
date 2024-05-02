const express = require('express');// Import the Express module
const app = express();// Create an instance of the Express application
const router = express.Router(); // Import the Router module from Express

const logincontroller=require("../controller/logincontroller")

router.post('/login',logincontroller.post);

module.exports=router