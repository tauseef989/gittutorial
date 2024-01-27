const express = require('express');
const path=require("path");
const bodyparser=require('body-parser');
const app = express();
const rootDir = require('./util/path');
const routesadmin=require('./routes/admin');
const routesshop=require('./routes/shop');
app.use(bodyparser.urlencoded({extended:false}));
app.use('/admin',routesadmin);
app.use(routesshop);
app.use((req,res,next)=>{
  res.status(404).sendFile(path.join(rootDir,'views','404.html'));
})
app.listen(4000, () => {
  console.log('Server is running on port 4000');
}) 