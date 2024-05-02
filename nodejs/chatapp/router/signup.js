const express = require('express');// Import the Express module
const app = express();// Create an instance of the Express application
const router = express.Router(); // Import the Router module from Express

const signupcontroller=require("../controller/signupcontroller")

router.post('/signup',signupcontroller.post);
module.exports=router