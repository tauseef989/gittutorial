const http=require("http");
const server=http.createServer((req,res)=>{
  console.log(req.url,req.headers,req.method);
  res.setHeader('content-type','text/html');
  if (req.url === "/home") {
    res.write("<html><body><h1>Welcome home</h1></body></html>");
} else if (req.url === "/about") {
    res.write("<html><body><h1>Welcome to About Us page</h1></body></html>");
} else if (req.url === "/node") {
    res.write("<html><body><h1>Welcome to my Node.js project</h1></body></html>");
} else {
    // Default response for other URLs
    res.write("<html><body><h1>Page not found</h1></body></html>");
}
  res.end();

});
server.listen(4000);