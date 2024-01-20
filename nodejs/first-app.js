const express = require("express");
const bodyparser=require("body-parser");
const app = express();
app.use(bodyparser.urlencoded({extended:false}));

app.use("/add-product", (req, res, next) => {
  console.log("qwerty");
  res.send('<form action="/product" method="POST"><input type="text" name="title"><input type="number" name="size"><button type="submit">submit</button></form>');
});
app.post("/product",(req,res,next)=>{
  console.log(req.body)

  res.redirect("/");

})
app.use("/", (req, res, next) => {
  console.log("wasd");
  res.send("<h1>hi</h1>");
});

app.listen(4000);
