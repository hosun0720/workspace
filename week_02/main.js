// var http = require("http");
// var app = http.createServer(function(){

// });
// app.listen(3000)
// 형태가 유지되는 기본 포맷

var http = require("http");
var fs = require("fs");
var urlm = require("url");
var app = http.createServer(function (req, res) {
  var url = req.url;
  var contents = "";
  var queryData = urlm.parse(url, true).pathname;
  console.log(queryData);
  console.log(url);
  if (url == "person") {
    contents =
      "<html><head></head><body><ol><li>name:Kim Hoseon</li><li>birth:2002-02-20</li></ol></body></html>";
  }
  if (url == "/") {
    contents = "<html><head></head><body><h1>Hi, Welcome!</h1></body></html>";
  }
  if (url == "/index") {
    contents = fs.readFileSync(__dirname + "/index.html");
  }
  if (url == "/1") {
    contents = fs.readFileSync(__dirname + "/html.html");
  }
  if (url == "/2") {
    contents = fs.readFileSync(__dirname + "/css.html");
  }
  if (url == "/3") {
    contents = fs.readFileSync(__dirname + "/js.html");
  }
  if (url == "/favicon.ico") {
    return res.writeHead(404);
  }
  res.writeHead(200);
  res.end(contents);
});
app.listen(3000);
