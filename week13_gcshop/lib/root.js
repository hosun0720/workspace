const db = require("./db");
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

module.exports = {
  home: (req, res) => {
    var { login, name, cls } = authIsOwner(req, res);
    var sql1 = `select * from boardtype;`;
    var sql2 = `select * from product;`;
    db.query(sql1 + sql2, (error, results) => {
      var context = {
        who: name,
        login: login,
        body: "product.ejs",
        cls: cls,
        boardtypes: results[0],
        results: results[1],
        buttonCUD: false,
      };
      res.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },

  categoryview: (req, res) => {
    var categ = req.params.categ;
    var loginInfo = authIsOwner(req, res);
    var main_id = categ.substring(0, 4);
    var sub_id = categ.substring(4, 8);
    var sql1 = `SELECT * FROM code; `;
    var sql2 = `SELECT * FROM product WHERE main_id = ? AND sub_id = ?; `;

    db.query(sql1 + sql2, [main_id, sub_id], (error, results) => {
      if (error) throw error;

      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,

        body: "product.ejs",
        categoryList: results[0],
        results: results[1],
        current_categ: categ,
        buttonCUD: false,
      };

      req.app.render("mainFrame", context, (err, html) => {
        if (err) throw err;
        res.end(html);
      });
    });
  },

  search: (req, res) => {
    var post = req.body;
    var keyword = post.search || "";
    var loginInfo = authIsOwner(req, res);
    var searchKeyword = `%${keyword}%`;
    db.query(
      `
      SELECT * FROM product 
      WHERE name LIKE ? 
         OR brand LIKE ? 
         OR supplier LIKE ?;
    `,
      [searchKeyword, searchKeyword, searchKeyword],
      (error, results) => {
        if (error) throw error;
        var context = {
          who: loginInfo.name,
          login: loginInfo.login,
          cls: loginInfo.cls,
          body: "product.ejs",
          results: results,
          buttonCUD: false,
        };
        req.app.render("mainFrame", context, (err, html) => {
          if (err) throw err;
          res.end(html);
        });
      },
    );
  },

  detail: (req, res) => {
    var prodId = req.params.prodId;
    var loginInfo = authIsOwner(req, res);
    var sql1 = `SELECT * FROM boardtype; `;
    var sql2 = `SELECT * FROM product WHERE prod_id = ?; `;

    db.query(sql1 + sql2, [prodId], (error, results) => {
      if (error) throw error;

      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,

        body: "productDetail.ejs",
        boardtypes: results[0],
        p: results[1][0],
      };

      req.app.render("mainFrame", context, (err, html) => {
        if (err) throw err;
        res.end(html);
      });
    });
  },
};
