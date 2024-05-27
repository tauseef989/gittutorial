const express = require('express');// Import the Express module
const app = express();// Create an instance of the Express application
const router = express.Router(); // Import the Router module from Express

const download=require('../controller/controllerdownload')

router.get('/download', download);
module.exports=router 