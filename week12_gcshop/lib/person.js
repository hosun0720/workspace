var db = require("./db");

function checkMNG(req, res) {
  if (!req.session.is_logined || req.session.cls !== "MNG") {
    res.send(`
        <script>
            alert("관리자 권한이 없습니다.");
            location.href = "/";
        </script>
    `);
    return null;
  }
  return {
    name: req.session.name,
    login: req.session.is_logined,
    cls: req.session.cls,
  };
}

module.exports = {
  view: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var sql1 = `SELECT * FROM boardtype; `;
    var sql2 = `SELECT * FROM person; `;

    db.query(sql1 + sql2, (error, results) => {
      if (error) throw error;

      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,
        body: "person.ejs",
        boardtypes: results[0],
        results: results[1],
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },

  create: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    db.query("SELECT * FROM boardtype", (error, results) => {
      if (error) throw error;

      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,
        body: "personC.ejs",
        boardtypes: results,
      };

      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },

  create_process: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var post = req.body;

    db.query(
      `INSERT INTO person (loginid, password, name, mf, address, tel, birth, class) 
       VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        post.loginid,
        post.password,
        post.name,
        post.mf,
        post.address,
        post.tel,
        post.birth,
        post.class,
      ],
      (error, result) => {
        if (error) throw error;
        res.redirect("/person/view");
      },
    );
  },

  update: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var loginid = req.params.loginid;

    var sql1 = `SELECT * FROM boardtype; `;
    var sql2 = `SELECT * FROM person WHERE loginid = ?; `;

    db.query(sql1 + sql2, [loginid], (error, results) => {
      if (error) throw error;

      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,
        body: "personU.ejs",
        boardtypes: results[0],
        p: results[1][0],
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },

  update_process: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var post = req.body;

    db.query(
      `UPDATE person SET password=?, name=?, mf=?, address=?, tel=?, birth=?, class=? 
       WHERE loginid=?`,
      [
        post.password,
        post.name,
        post.mf,
        post.address,
        post.tel,
        post.birth,
        post.class,
        post.loginid,
      ],
      (error, result) => {
        if (error) throw error;
        res.redirect("/person/view");
      },
    );
  },

  delete_process: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var loginid = req.params.loginid;

    db.query(
      "DELETE FROM person WHERE loginid = ?",
      [loginid],
      (error, result) => {
        if (error) throw error;
        res.redirect("/person/view");
      },
    );
  },
};
