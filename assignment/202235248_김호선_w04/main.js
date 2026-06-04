const express = require("express");
const app = express();
// const db = require("./lib/db");
var applist = require("./lib/applist");

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  applist.home(req, res);
});

app.get("/favicon.ico", (req, res) => res.writeHead(204).end());

app.get("/:name", (req, res) => {
  applist.detail(req, res);
});

app.listen(3000, () => console.log("Example app listening on port 3000"));
