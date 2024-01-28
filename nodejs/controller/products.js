exports.getpostproduct=(req,res,next)=>{
  console.log(req.body)

  res.redirect("/");

};
const rootDir = require('../util/path');
exports.getproduct=(req, res, next) => {
  console.log("qwerty");
  res.sendFile(path.join(rootDir,'views','add-product.html'));
};
exports.getpro=(req, res, next) => {
  console.log("wasd");
  res.sendFile(path.join(rootDir,'views','shop.html'));
}