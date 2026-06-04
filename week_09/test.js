var express = require("express");
var parseurl = require("parseurl");
var session = require("express session");
var MySqlStore = require("express mysql session")(session);
var options = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "webdb2026",
};
var sessionStore = new MySqlStore(options);
var app = express();
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  }),
);

app.get("/", function (req, res, next) {});
app.listen(3000, function () {
  console.log("3000!");
});
