const express = require("express");
var router = express.Router();
var table = require("../lib/table");

router.get("/", (req, res) => {
  table.view(req, res);
});

router.get("/view/:tableName", (req, res) => {
  table.tableview(req, res);
});

router.get("/create", (req, res) => {
  table.create(req, res);
});

router.post("/create_process", (req, res) => {
  table.create_process(req, res);
});

router.get("/update/:tableName/:id", (req, res) => {
  table.update(req, res);
});

router.post("/update_process", (req, res) => {
  table.update_process(req, res);
});

router.get("/delete/:tableName/:id", (req, res) => {
  table.delete_process(req, res);
});

module.exports = router;
