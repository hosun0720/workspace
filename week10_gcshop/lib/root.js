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
    db.query(`select * from product;`, (error, results) => {
      var context = {
        who: name,
        login: login,
        body: "product.ejs",
        cls: cls,
        results: results,
        buttonCUD: false,
      };
      res.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },
};
