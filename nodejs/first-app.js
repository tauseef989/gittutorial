const express = require('express');
const bodyparser=require('body-parser');
const app = express();
const routesadmin=require('./routes/admin');
const routesshop=require('./routes/shop');
app.use(bodyparser.urlencoded({extended:false}));
app.use('/admin',routesadmin);
app.use(routesshop);
app.use((req,res,next)=>{
  res.status(404).send('<h1>page not found</h1>')
})
app.listen(4000, () => {
  console.log('Server is running on port 4000');
}) 