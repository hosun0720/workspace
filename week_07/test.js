const express = require("express");
var app = express();
var cookie = require("cookie");
app.get("/", function (req, res) {
  console.log(req.headers.cookie);
  if (req.headers.cookie !== undefined) {
    var cookies = cookie.parse(req.headers.cookie);
  } else {
    res.writeHead(200, {
      "Set-Cookie": ["yummy_cookie=choco", "tasty_cookie=strawberry"],
    });
  }
  console.log(cookies);
  res.end("Cookie!");
});
app.listen(3000, () => console.log("Cookie Test!"));
