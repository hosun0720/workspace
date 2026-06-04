const express = require("express");
var router = express.Router();
var board = require("../lib/board");

router.get("/type/view", (req, res) => {
  board.typeview(req, res);
});

router.get("/type/create", (req, res) => {
  board.typecreate(req, res);
});

router.post("/type/create_process", (req, res) => {
  board.typecreate_process(req, res);
});

router.get("/type/update/:type_id", (req, res) => {
  board.typeupdate(req, res);
});

router.post("/type/update_process", (req, res) => {
  board.typeupdate_process(req, res);
});

router.get("/type/delete/:type_id", (req, res) => {
  board.typedelete_process(req, res);
});

router.get("/view/:type_id/:pNum", (req, res) => {
  board.view(req, res);
});

router.get("/create/:type_id", (req, res) => {
  board.create(req, res);
});

router.post("/create_process", (req, res) => {
  board.create_process(req, res);
});

router.get("/detail/:board_id/:pNum/:re_YN", (req, res) => {
  board.detail(req, res);
});

router.get("/update/:board_id/:type_id/:pNum", (req, res) => {
  board.update(req, res);
});

router.post("/update_process", (req, res) => {
  board.update_process(req, res);
});

router.get("/delete/:board_id/:type_id/:pNum", (req, res) => {
  board.delete_process(req, res);
});

router.get("/answer/:board_id/:pNum", (req, res) => {
  board.answer(req, res);
});

router.post("/answer_process", (req, res) => {
  board.answer_process(req, res);
});

module.exports = router;
