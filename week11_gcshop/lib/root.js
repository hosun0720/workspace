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
};
