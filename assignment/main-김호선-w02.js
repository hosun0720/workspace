var http = require("http");
var fs = require("fs");
var urlm = require("url");
var app = http.createServer(function (req, res) {
  var url = req.url;
  var contents = "";
  var queryData = urlm.parse(url, true).pathname;
  console.log(queryData);
  console.log(url);
  if (url == "/") {
    contents = `<html><head></head><body><h1>Words Example</h1><ol><li><a href="/aim">aim</a></li><li><a href="/compact">compact</a></li></ol></body></html>`;
  }
  if (url == "/aim") {
    contents =
      "<html><head></head><body><p>The soccer team aimed to make it to semifinals.</p></body></html>";
  }
  if (url == "/compact") {
    contents =
      "<html><head></head><body><p>The Gardener dug a hole in the compact soil.</p></body></html>";
  }
  if (url == "/BOOK") {
    contents = `<html><head><meta charset="utf-8"></head><body><h1>책과 음악이 있는 곳</h1><hr><ol><li><h3><a href="/BOOK">책</a></h3><ul><li>총균쇠</li><li>내면소통</li></ul></li><li><h3><a href="/MUSIC">음악</a></h3></li></ol></body></html>`;
  }
  if (url == "/MUSIC") {
    contents = `<html><head><meta charset="utf-8"></head><body><h1>책과 음악이 있는 곳</h1><hr><ol><li><h3><a href="/BOOK">책</a></h3><li><h3><a href="/MUSIC">음악</a></h3><ul><li>바빌론 강가에서</li><li>I'll be missing you</li></ul></li></ol></body></html>`;
  }
  res.writeHead(200);
  res.end(contents);
});
app.listen(3000);
