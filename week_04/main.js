// http://localhost:3000
const express = require("express");
const app = express();
const db = require("./lib/db");
var topic = require("./lib/topic");

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  topic.home(req, res);
});

app.get("/:id", (req, res) => {
  topic.page(req, res);
});

app.get("/favicon.ico", (req, res) => res.writeHead(404));
app.listen(3000, () => console.log("Example app listening on port 3000"));
