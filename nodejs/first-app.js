const http = require('http');
const modulehandler=require("./exp")
const server = http.createServer(modulehandler)
server.listen(4000);
