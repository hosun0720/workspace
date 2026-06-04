const { create_process } = require("./code");
var db = require("./db");
var sanitizedHtml = require("sanitize-html");

function authIsOwner(req, res) {
  var name = "Guest";
  var login = false;
  var cls = "NON";
  if (req.session && req.session.is_logined) {
    name = req.session.name;
    login = true;
    cls = req.session.cls;
  }
  return { name, login, cls };
}

function checkMNG(req, res) {
  var info = authIsOwner(req, res);
  if (info.cls !== "MNG") {
    res.send(`
        <script>
            alert("관리자 권한이 없습니다.");
            location.href = "/";
        </script>
    `);
    return null;
  }
  return info;
}

module.exports = {
  view: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    db.query("SELECT * FROM product", (error, results) => {
      if (error) throw error;

      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,
        body: "product.ejs",
        results: results,
        buttonCUD: true,
      };

      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },

  create: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) {
      return;
    }

    db.query("SELECT * FROM code", (error, codes) => {
      if (error) {
        return res.status(500).send("DB 에러: " + error.message);
      }

      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,
        body: "productC.ejs",
        category: codes,
      };
      res.render("mainFrame", context);
    });
  },

  create_process: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var post = req.body;
    var image = req.file ? req.file.filename : "no-image.jpg";

    db.query(
      `INSERT INTO product (main_id, sub_id, name, price, stock, brand, supplier, image) 
       VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        post.main_id,
        post.sub_id,
        post.name,
        post.price,
        post.stock,
        post.brand,
        post.supplier,
        image,
      ],
      (error, result) => {
        if (error) throw error;
        res.redirect("/product/view");
      },
    );
  },

  update: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var prod_id = req.params.prod_id;
    db.query("SELECT * FROM code", (err1, codes) => {
      db.query(
        "SELECT * FROM product WHERE prod_id = ?",
        [prod_id],
        (err2, result) => {
          if (err2) throw err2;

          var context = {
            who: loginInfo.name,
            login: loginInfo.login,
            cls: loginInfo.cls,
            body: "productU.ejs",
            category: codes,
            p: result[0],
          };
          req.app.render("mainFrame", context, (err, html) => {
            res.end(html);
          });
        },
      );
    });
  },

  update_process: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var post = req.body;
    var image = req.file ? req.file.filename : post.old_image;

    db.query(
      `UPDATE product SET main_id=?, sub_id=?, name=?, price=?, stock=?, brand=?, supplier=?, image=? 
       WHERE prod_id=?`,
      [
        post.main_id,
        post.sub_id,
        post.name,
        post.price,
        post.stock,
        post.brand,
        post.supplier,
        image,
        post.prod_id,
      ],
      (error, result) => {
        if (error) throw error;
        res.redirect("/product/view");
      },
    );
  },

  delete_process: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var prod_id = req.params.prod_id;

    db.query(
      "DELETE FROM product WHERE prod_id = ?",
      [prod_id],
      (error, result) => {
        if (error) throw error;
        res.redirect("/product/view");
      },
    );
  },
};
