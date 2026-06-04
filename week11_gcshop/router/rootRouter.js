const express = require("express");
var router = express.Router();
var root = require("../lib/root");

router.get("/", (req, res) => {
  root.home(req, res);
});

router.get("/category/:categ", (req, res) => {
  root.categoryview(req, res);
});

module.exports = router;
