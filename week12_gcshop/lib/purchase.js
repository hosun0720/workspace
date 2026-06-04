var db = require("./db");

function authIsOwner(req, res) {
  var name = "Guest";
  var login = false;
  var cls = "NON";
  var loginid = "";

  if (req.session && req.session.is_logined) {
    name = req.session.name;
    login = true;
    cls = req.session.cls;
    loginid = req.session.loginid;
  }
  return { name, login, cls, loginid };
}

function getFormattedDate() {
  var d = new Date();
  var year = d.getFullYear();
  var month = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  var hours = String(d.getHours()).padStart(2, "0");
  var minutes = String(d.getMinutes()).padStart(2, "0");
  var seconds = String(d.getSeconds()).padStart(2, "0");

  return `${year}.${month}.${day} : ${hours}시 ${minutes}분 ${seconds}초`;
}

module.exports = {
  purchasedetail: (req, res) => {
    var loginInfo = authIsOwner(req, res);
    // 비로그인 사용자가 접근할 경우 예외 처리
    if (!loginInfo.login) {
      return res.send(
        `<script>alert("로그인이 필요한 서비스입니다."); location.href="/auth/login";</script>`,
      );
    }

    var prodId = req.params.prodId;
    var sql1 = `SELECT * FROM boardtype; `;
    var sql2 = `SELECT * FROM product WHERE prod_id = ?; `;

    db.query(sql1 + sql2, [prodId], (error, results) => {
      if (error) throw error;

      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,
        body: "purchaseDetail.ejs",
        boardtypes: results[0],
        p: results[1][0],
      };

      req.app.render("mainFrame", context, (err, html) => {
        if (err) throw err;
        res.end(html);
      });
    });
  },

  create_process: (req, res) => {
    var loginInfo = authIsOwner(req, res);
    if (!loginInfo.login) {
      return res.send(
        `<script>alert("로그인 세션이 만료되었습니다."); location.href="/";</script>`,
      );
    }

    var post = req.body;
    var loginid = loginInfo.loginid;
    var prod_id = post.prod_id;
    var price = parseInt(post.price);
    var qty = parseInt(post.qty);
    var total = price * qty;
    var dateStr = getFormattedDate();
    if (!qty || qty <= 0) {
      return res.send(
        `<script>alert("올바른 수량을 입력해주세요."); history.back();</script>`,
      );
    }
    db.query(
      `
      INSERT INTO purchase (loginid, prod_id, date, price, point, qty, total, payYN, cancel) 
      VALUES (?, ?, ?, ?, 0, ?, ?, 'Y', 'N');
    `,
      [loginid, prod_id, dateStr, price, qty, total],
      (error, result) => {
        if (error) throw error;
        res.redirect("/purchase");
      },
    );
  },

  purchase: (req, res) => {
    var loginInfo = authIsOwner(req, res);
    if (!loginInfo.login) {
      return res.send(
        `<script>alert("로그인이 필요합니다."); location.href="/auth/login";</script>`,
      );
    }

    var sql1 = `SELECT * FROM boardtype; `;
    var sql2 = `
      SELECT purchase.*, product.name AS prod_name, product.image AS prod_image 
      FROM purchase 
      JOIN product ON purchase.prod_id = product.prod_id 
      WHERE purchase.loginid = ? 
      ORDER BY purchase.purchase_id DESC;
    `;

    db.query(sql1 + sql2, [loginInfo.loginid], (error, results) => {
      if (error) throw error;

      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,
        body: "purchase.ejs",
        boardtypes: results[0],
        results: results[1],
      };

      req.app.render("mainFrame", context, (err, html) => {
        if (err) throw err;
        res.end(html);
      });
    });
  },

  cancel_process: (req, res) => {
    var loginInfo = authIsOwner(req, res);
    if (!loginInfo.login) {
      return res.send(
        `<script>alert("권한이 없습니다."); location.href="/";</script>`,
      );
    }

    var purchaseId = req.params.purchaseId;
    var sql = `UPDATE purchase SET cancel = 'Y' WHERE purchase_id = ?;`;

    db.query(sql, [purchaseId], (error, result) => {
      if (error) throw error;
      res.redirect("/purchase");
    });
  },

  cart: (req, res) => {
    var loginInfo = authIsOwner(req, res);
    if (!loginInfo.login) {
      return res.send(
        `<script>alert("로그인이 필요합니다."); location.href="/auth/login";</script>`,
      );
    }
    var sql1 = `SELECT * FROM boardtype; `;
    var sql2 = `
      SELECT cart.*, product.name AS prod_name, product.image AS prod_image, product.price AS prod_price 
      FROM cart 
      JOIN product ON cart.prod_id = product.prod_id 
      WHERE cart.loginid = ? 
      ORDER BY cart.cart_id DESC;
    `;

    db.query(sql1 + sql2, [loginInfo.loginid], (error, results) => {
      if (error) throw error;

      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,
        body: "cart.ejs",
        boardtypes: results[0],
        results: results[1],
      };

      req.app.render("mainFrame", context, (err, html) => {
        if (err) throw err;
        res.end(html);
      });
    });
  },

  cart_create_process: (req, res) => {
    var loginInfo = authIsOwner(req, res);
    if (!loginInfo.login) {
      return res.send(
        `<script>alert("로그인이 필요한 서비스입니다."); location.href="/auth/login";</script>`,
      );
    }

    var post = req.body;
    var loginid = loginInfo.loginid;
    var prod_id = post.prod_id;
    var dateStr = getFormattedDate();

    db.query(
      `SELECT COUNT(*) AS cnt FROM cart WHERE loginid = ? AND prod_id = ?`,
      [loginid, prod_id],
      (error, results) => {
        if (error) throw error;

        if (results[0].cnt > 0) {
          return res.send(
            `<script>alert("장바구니에 이미 있는 제품입니다."); location.href="/purchase/cart";</script>`,
          );
        }
        db.query(
          `INSERT INTO cart (loginid, prod_id, date) VALUES (?, ?, ?)`,
          [loginid, prod_id, dateStr],
          (error, result) => {
            if (error) throw error;
            res.redirect("/purchase/cart");
          },
        );
      },
    );
  },

  cart_delete_process: (req, res) => {
    var post = req.body;
    var cartIds = post.cart_ids;
    db.query(
      `DELETE FROM cart WHERE cart_id IN (?)`,
      [cartIds],
      (error, result) => {
        if (error) throw error;
        res.redirect("/purchase/cart");
      },
    );
  },

  cart_purchase_process: (req, res) => {
    var loginInfo = authIsOwner(req, res);
    var post = req.body;
    var cartIds = post.cart_ids;
    var dateStr = getFormattedDate();

    if (!Array.isArray(cartIds)) {
      cartIds = [cartIds];
    }

    var promises = cartIds.map((cartId) => {
      return new Promise((resolve, reject) => {
        db.query(
          `SELECT prod_id FROM cart WHERE cart_id = ?`,
          [cartId],
          (err, cartRes) => {
            if (err) return reject(err);
            var prod_id = cartRes[0].prod_id;
            db.query(
              `SELECT price FROM product WHERE prod_id = ?`,
              [prod_id],
              (err, prodRes) => {
                if (err) return reject(err);
                var price = prodRes[0].price;
                var qty = parseInt(post["qty_" + cartId]) || 1;
                var total = price * qty;
                db.query(
                  `INSERT INTO purchase (loginid, prod_id, date, price, point, qty, total, payYN, cancel) 
               VALUES (?, ?, ?, ?, 0, ?, ?, 'Y', 'N')`,
                  [loginInfo.loginid, prod_id, dateStr, price, qty, total],
                  (err, insertRes) => {
                    if (err) return reject(err);
                    db.query(
                      `DELETE FROM cart WHERE cart_id = ?`,
                      [cartId],
                      (err, deleteRes) => {
                        if (err) return reject(err);
                        resolve();
                      },
                    );
                  },
                );
              },
            );
          },
        );
      });
    });
    Promise.all(promises)
      .then(() => {
        res.redirect("/purchase");
      })
      .catch((err) => {
        throw err;
      });
  },
};
