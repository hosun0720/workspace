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

module.exports = {
  login: (req, res) => {
    var { name, login, cls } = authIsOwner(req, res);
    var context = {
      who: name,
      login: login,
      body: "login.ejs",
      cls: cls,
    };
    req.app.render("mainFrame", context, (err, html) => {
      res.end(html);
    });
  },

  login_process: (req, res) => {
    var post = req.body;
    var sntzedLoginid = sanitizedHtml(post.loginid);
    var sntzedPassword = sanitizedHtml(post.password);

    db.query(
      "select count(*) as num from person where loginid = ? and password = ?",
      [sntzedLoginid, sntzedPassword],
      (error, results) => {
        if (results[0].num === 1) {
          db.query(
            "select name, class, loginid from person where loginid = ? and password = ?",
            [sntzedLoginid, sntzedPassword],
            (error, result) => {
              req.session.is_logined = true;
              req.session.loginid = result[0].loginid;
              req.session.name = result[0].name;
              req.session.cls = result[0].class;
              req.session.save(() => {
                res.redirect("/");
              });
            },
          );
        } else {
          req.session.is_logined = false;
          req.session.name = "Guest";
          req.session.cls = "NON";
          req.session.save(() => {
            res.redirect("/");
          });
        }
      },
    );
  },

  logout_process: (req, res) => {
    req.session.destroy((err) => {
      res.redirect("/");
    });
  },
};
