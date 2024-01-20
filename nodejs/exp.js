const fs = require('fs');
const modulehandler=(req,res)=>{
  const method = req.method;
  const url = req.url;

  if (url === "/") {
    res.write("<html>");
    res.write("<head><title>Enter message</title></head>");
    res.write("<body><form action='/message' method='POST'><input type='text' name='message'><button type='submit'>Send</button></form></body>");
    const messageContent = fs.readFileSync("message.txt", "utf8");
    if (messageContent) {
      res.write("<p>Message from file: " + messageContent + "</p>");
    }
    res.write("</html>");
    return res.end();
  }

  if (url === "/message" && method === "POST") {
    const body = [];

    req.on("data", (chunk) => {
      body.push(chunk);
    });

    req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString();
      const message = parsedBody.split("=")[1];

      fs.writeFileSync("message.txt", message);
 
      res.statusCode = 302;
      res.setHeader("Location", "/");
      return res.end();
    });
  }

}
module.exports=modulehandler;
// module.export.modulehandler
// module.export={
//   handler:modulehandler
//   text:from other file
// }