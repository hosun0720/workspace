const express = require("express");
var router = express.Router();
var root = require("../lib/root");

router.get("/", (req, res) => {
  root.home(req, res);
});

router.get("/category/:categ", (req, res) => {
  root.categoryview(req, res);
});

router.post("/search", (req, res) => {
  root.search(req, res);
});

router.get("/detail/:prodId", (req, res) => {
  root.detail(req, res);
});

const admin = require("../lib/admin");

router.get("/cartview", (req, res) => {
  admin.cartview(req, res);
});

router.get("/cartupdate/:cartId", (req, res) => {
  admin.cartupdate(req, res);
});

router.post("/cartupdate_process", (req, res) => {
  admin.cartupdate_process(req, res);
});

router.get("/cartdelete/:cartId", (req, res) => {
  admin.cartdelete_process(req, res);
});

router.get("/purchaseview", (req, res) => {
  admin.purchaseview(req, res);
});

router.get("/purchaseupdate/:purchaseId", (req, res) => {
  admin.purchaseupdate(req, res);
});

router.post("/purchaseupdate_process", (req, res) => {
  admin.purchaseupdate_process(req, res);
});

router.get("/purchasedelete/:purchaseId", (req, res) => {
  admin.purchasedelete_process(req, res);
});

module.exports = router;
