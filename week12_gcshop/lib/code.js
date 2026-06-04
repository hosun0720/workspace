const board = require("./board");
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

    var sql1 = `select * from boardtype;`;
    var sql2 = `SELECT * FROM code;`;

    db.query(sql1 + sql2, (error, results) => {
      if (error) throw error;

      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,
        body: "code.ejs",
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

    db.query(`select * from boardtype`, (err, results) => {
      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,
        body: "codeC.ejs",
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
    var sntzedMainId = sanitizedHtml(post.main_id);
    var sntzedSubId = sanitizedHtml(post.sub_id);
    var sntzedMainName = sanitizedHtml(post.main_name);
    var sntzedSubName = sanitizedHtml(post.sub_name);
    var sntzedStart = sanitizedHtml(post.start);
    var sntzedEnd = sanitizedHtml(post.end);

    db.query(
      "INSERT INTO code (main_id, sub_id, main_name, sub_name, start, end) VALUES (?, ?, ?, ?, ?, ?)",
      [
        sntzedMainId,
        sntzedSubId,
        sntzedMainName,
        sntzedSubName,
        sntzedStart,
        sntzedEnd,
      ],
      (error, result) => {
        if (error) {
          throw error;
          return res.send(
            `<script>alert("등록 실패! ID 중복 여부를 확인하세요."); history.back();</script>`,
          );
        }
        res.redirect("/code/view");
      },
    );
  },

  update: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var { main, sub, start, end } = req.params;
    var sql1 = `select * from boardtype;`;
    var sql2 = `SELECT * FROM code WHERE main_id=? AND sub_id=? AND start=? AND end=?;`;

    db.query(sql1 + sql2, [main, sub, start, end], (error, results) => {
      if (error) throw error;

      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,
        body: "codeU.ejs",
        boardtypes: results[0],
        result: results[1][0],
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
    var sntzedMainId = sanitizedHtml(post.main_id);
    var sntzedSubId = sanitizedHtml(post.sub_id);
    var sntzedMainName = sanitizedHtml(post.main_name);
    var sntzedSubName = sanitizedHtml(post.sub_name);
    var sntzedStart = sanitizedHtml(post.start);
    var sntzedEnd = sanitizedHtml(post.end);

    db.query(
      `
        UPDATE code 
        SET main_name=?, sub_name=?, end=? 
        WHERE main_id=? AND sub_id=? And start=?
    `,
      [
        sntzedMainName,
        sntzedSubName,
        sntzedEnd,
        sntzedMainId,
        sntzedSubId,
        sntzedStart,
      ],
      (error, result) => {
        if (error) throw error;
        res.redirect("/code/view");
      },
    );
  },

  delete_process: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var { main, sub, start, end } = req.params;

    db.query(
      "DELETE FROM code WHERE main_id=? AND sub_id=? AND start=? AND end=?",
      [main, sub, start, end],
      (error, result) => {
        if (error) throw error;
        res.redirect("/code/view");
      },
    );
  },
};
