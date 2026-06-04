var db = require("./db");

function checkMNG(req, res) {
  if (!req.session || !req.session.is_logined || req.session.cls !== "MNG") {
    res.send(
      `<script>alert("관리자 권한이 없습니다."); location.href = "/";</script>`,
    );
    return null;
  }
  return req.session;
}

module.exports = {
  cartview: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var sql1 = `SELECT * FROM boardtype; `;
    var sql2 = `
      SELECT cart.*, person.name AS user_name, product.name AS prod_name 
      FROM cart 
      JOIN person ON cart.loginid = person.loginid 
      JOIN product ON cart.prod_id = product.prod_id 
      ORDER BY cart.cart_id DESC;
    `;

    db.query(sql1 + sql2, (error, results) => {
      if (error) throw error;
      res.render("mainFrame", {
        who: loginInfo.name,
        login: true,
        cls: loginInfo.cls,
        body: "cartView.ejs",
        boardtypes: results[0],
        results: results[1],
      });
    });
  },

  cartupdate: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var cartId = req.params.cartId;
    var sql1 = `SELECT * FROM boardtype; `;
    var sql2 = `SELECT * FROM cart WHERE cart_id = ?; `;
    var sql3 = `SELECT loginid, name FROM person; `;
    var sql4 = `SELECT prod_id, name FROM product; `;

    db.query(sql1 + sql2 + sql3 + sql4, [cartId], (error, results) => {
      if (error) throw error;
      res.render("mainFrame", {
        who: loginInfo.name,
        login: true,
        cls: loginInfo.cls,
        body: "cartU.ejs",
        boardtypes: results[0],
        c: results[1][0],
        customers: results[2],
        products: results[3],
      });
    });
  },

  cartupdate_process: (req, res) => {
    if (!checkMNG(req, res)) return;
    var post = req.body;
    db.query(
      `UPDATE cart SET loginid = ?, prod_id = ? WHERE cart_id = ?`,
      [post.loginid, post.prod_id, post.cart_id],
      (error, result) => {
        if (error) throw error;
        res.redirect("/cartview");
      },
    );
  },

  cartdelete_process: (req, res) => {
    if (!checkMNG(req, res)) return;
    var cartId = req.params.cartId;
    db.query(
      `DELETE FROM cart WHERE cart_id = ?`,
      [cartId],
      (error, result) => {
        if (error) throw error;
        res.redirect("/cartview");
      },
    );
  },

  purchaseview: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var sql1 = `SELECT * FROM boardtype; `;
    var sql2 = `
      SELECT purchase.*, person.name AS user_name, product.name AS prod_name 
      FROM purchase 
      JOIN person ON purchase.loginid = person.loginid 
      JOIN product ON purchase.prod_id = product.prod_id 
      ORDER BY purchase.purchase_id DESC;
    `;

    db.query(sql1 + sql2, (error, results) => {
      if (error) throw error;
      res.render("mainFrame", {
        who: loginInfo.name,
        login: true,
        cls: loginInfo.cls,
        body: "purchaseView.ejs",
        boardtypes: results[0],
        results: results[1],
      });
    });
  },

  purchaseupdate: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var purchaseId = req.params.purchaseId;
    var sql1 = `SELECT * FROM boardtype; `;
    var sql2 = `SELECT * FROM purchase WHERE purchase_id = ?; `;
    var sql3 = `SELECT loginid, name FROM person; `;
    var sql4 = `SELECT prod_id, name FROM product; `;

    db.query(sql1 + sql2 + sql3 + sql4, [purchaseId], (error, results) => {
      if (error) throw error;
      res.render("mainFrame", {
        who: loginInfo.name,
        login: true,
        cls: loginInfo.cls,
        body: "purchaseU.ejs",
        boardtypes: results[0],
        p: results[1][0],
        customers: results[2],
        products: results[3],
      });
    });
  },

  purchaseupdate_process: (req, res) => {
    if (!checkMNG(req, res)) return;
    var post = req.body;
    db.query(
      `UPDATE purchase SET loginid=?, prod_id=?, price=?, point=?, qty=?, total=?, payYN=?, cancel=? WHERE purchase_id=?`,
      [
        post.loginid,
        post.prod_id,
        post.price,
        post.point,
        post.qty,
        post.total,
        post.payYN,
        post.cancel,
        post.purchase_id,
      ],
      (error, result) => {
        if (error) throw error;
        res.redirect("/purchaseview");
      },
    );
  },

  purchasedelete_process: (req, res) => {
    if (!checkMNG(req, res)) return;
    var purchaseId = req.params.purchaseId;
    db.query(
      `DELETE FROM purchase WHERE purchase_id = ?`,
      [purchaseId],
      (error, result) => {
        if (error) throw error;
        res.redirect("/purchaseview");
      },
    );
  },
};
