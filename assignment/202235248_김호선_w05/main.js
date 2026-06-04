const express = require("express");
const app = express();
const db = require("./lib/db");
var appslist = require("./lib/appslist");

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  appslist.home(req, res);
});

app.get("/create", (req, res) => {
  appslist.create(req, res);
});

app.post("/create_process", (req, res) => {
  appslist.create_process(req, res);
});

app.get("/update/:pageId", (req, res) => {
  appslist.update(req, res);
});

app.post("/update_process", (req, res) => {
  appslist.update_process(req, res);
});

app.get("/delete_process/:pageId", (req, res) => {
  appslist.delete_process(req, res);
});

app.get("/favicon.ico", (req, res) => res.writeHead(404));
app.listen(3000, () => console.log("Example app listening on port 3000"));
