const express = require("express");
var router = express.Router();
var purchase = require("../lib/purchase");

router.get("/detail/:prodId", (req, res) => {
  purchase.purchasedetail(req, res);
});

router.get("/", (req, res) => {
  purchase.purchase(req, res);
});

router.post("/create_process", (req, res) => {
  purchase.create_process(req, res);
});

router.get("/cancel_process/:purchaseId", (req, res) => {
  purchase.cancel_process(req, res);
});

router.get("/cart", (req, res) => {
  purchase.cart(req, res);
});

router.post("/cart/create_process", (req, res) => {
  purchase.cart_create_process(req, res);
});

router.post("/cart/delete_process", (req, res) => {
  purchase.cart_delete_process(req, res);
});

router.post("/cart/purchase_process", (req, res) => {
  purchase.cart_purchase_process(req, res);
});

module.exports = router;
