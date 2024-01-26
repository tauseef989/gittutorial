const express=require("express");
const app =express();
const fs=require("fs");
const bodyparser=require("body-parser");
app.use(bodyparser.urlencoded({extended:false}));
let loginid;

app.use("/login",(req,res,next)=>{
  res.send('<form  action="/" method="POST"><input type="text" id="1" name="loginid"><button type="submit">login</button></form>');


});
app.post('/',(req,res)=>{
  // const username=localStorage.getItem("username")
  if (req.body.loginid!==undefined){
    loginid=req.body.loginid;
    console.log(loginid);
  }
  if (req.body.message!==undefined){
    const message=req.body.message;
    console.log(message);
    fs.appendFileSync("info.txt",`${loginid}: ${message}\n`);
  }
    // Read messages from the file
    const messages = fs.readFileSync("info.txt", "utf-8").split('\n').filter(msg => msg.trim() !== '');

    // Display messages in their original order
    const originalOrderMessages = messages.map(msg => `<p>${msg}</p>`).join('');
  
  
  res.send(`${originalOrderMessages}
  <form action="/" method="POST">
    <input type="text" name="message">
      <button type="submit">send</button>
      </form>`);

});

app.use("/welcome",(req,res)=>{
  res.send('<h1>welcome to group</h1>');

});

app.listen(5000,()=>{
  console.log("server is running on port 5000");
}); 


