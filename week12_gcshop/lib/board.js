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
  typeview: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    db.query("SELECT * FROM boardtype", (error, results) => {
      if (error) throw error;

      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,
        body: "boardtype.ejs",
        boardtypes: results,
        results: results,
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },

  typecreate: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    db.query("SELECT * FROM boardtype", (error, results) => {
      if (error) throw error;

      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,
        body: "boardtypeC.ejs",
        boardtypes: results,
      };

      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },

  typecreate_process: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var post = req.body;
    // var sntzedtype_id = sanitizedHtml(post.type_id);
    var sntzedtitle = sanitizedHtml(post.title);
    var sntzeddescription = sanitizedHtml(post.description);
    var sntzedwrite_YN = sanitizedHtml(post.write_YN);
    var sntzedre_YN = sanitizedHtml(post.re_YN);
    var sntzednumPerPage = sanitizedHtml(post.numPerPage);

    db.query(
      `INSERT INTO boardtype ( title, description, write_YN, re_YN, numPerPage) 
       VALUES(?, ?, ?, ?, ?)`,
      [
        // sntzedtype_id,
        sntzedtitle,
        sntzeddescription,
        sntzedwrite_YN,
        sntzedre_YN,
        sntzednumPerPage,
      ],
      (error, result) => {
        if (error) throw error;
        res.redirect("/board/type/view");
      },
    );
  },

  typeupdate: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var type_id = req.params.type_id;
    var sql1 = `SELECT * FROM boardtype; `;
    var sql2 = `SELECT * FROM boardtype WHERE type_id = ?; `;

    db.query(sql1 + sql2, [type_id], (error, results) => {
      if (error) throw error;

      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,
        body: "boardtypeU.ejs",
        boardtypes: results[0],
        p: results[1][0],
      };
      req.app.render("mainFrame", context, (err, html) => {
        res.end(html);
      });
    });
  },

  typeupdate_process: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var post = req.body;
    var sntzedtype_id = sanitizedHtml(post.type_id);
    var sntzedtitle = sanitizedHtml(post.title);
    var sntzeddescription = sanitizedHtml(post.description);
    var sntzedwrite_YN = sanitizedHtml(post.write_YN);
    var sntzedre_YN = sanitizedHtml(post.re_YN);
    var sntzednumPerPage = sanitizedHtml(post.numPerPage);

    db.query(
      `UPDATE boardtype SET title=?, description=?, numPerPage=?, write_YN=?, re_YN=?
       WHERE type_id=?`,
      [
        sntzedtitle,
        sntzeddescription,
        sntzednumPerPage,
        sntzedwrite_YN,
        sntzedre_YN,
        sntzedtype_id,
      ],
      (error, result) => {
        if (error) throw error;
        res.redirect("/board/type/view");
      },
    );
  },

  typedelete_process: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var type_id = req.params.type_id;

    db.query(
      "SELECT EXISTS (SELECT 1 FROM board WHERE type_id = ?) as haveboard",
      [type_id],
      (error, results) => {
        if (error) throw error;

        if (results[0].haveboard) {
          res.send(`
          <script>
            alert("해당 게시판에 게시글이 남아 있어 삭제할 수 없습니다.");
            history.back();
          </script>
        `);
        } else {
          db.query(
            "DELETE FROM boardtype WHERE type_id = ?",
            [type_id],
            (error2, result) => {
              if (error2) throw error2;
              res.redirect("/board/type/view");
            },
          );
        }
      },
    );
  },

  view: (req, res) => {
    var { name, login, cls } = authIsOwner(req, res);
    var sntzedTypeId = sanitizedHtml(req.params.type_id);
    var pNum = req.params.pNum;

    var sql1 = `select * from boardtype; `;
    var sql2 = ` select * from boardtype where type_id = ${sntzedTypeId}; `;
    var sql3 = ` select count(*) as total from board where type_id = ${sntzedTypeId}; `;

    db.query(sql1 + sql2 + sql3, (error, results) => {
      if (error) throw error;

      var numPerPage = results[1][0].numPerPage;
      var offs = (pNum - 1) * numPerPage;
      var totalPages = Math.ceil(results[2][0].total / numPerPage);

      db.query(
        `select b.board_id as board_id, b.title as title, b.date as date, p.name as name, p.name as loginid
         from board b inner join person p on b.loginid = p.loginid 
         where b.type_id = ? and IFNULL(b.p_id, 0) = ? ORDER BY date desc, board_id desc LIMIT ? OFFSET ?`,
        [sntzedTypeId, 0, numPerPage, offs],
        (err, boards) => {
          if (err) throw err;

          var currentBoardType = results[1][0] || {
            title: "게시판",
            write_YN: "N",
          };

          var context = {
            who: name,
            login: login,
            cls: cls,
            userId: req.session.loginid || "",
            body: "board.ejs",
            boardtypes: results[0],
            btname: results[1],
            results: boards,
            pNum: pNum,
            totalPages: totalPages,
            type_id: sntzedTypeId,
            title: currentBoardType.title,
            write_YN: currentBoardType.write_YN,
          };

          req.app.render("mainFrame", context, (errRender, html) => {
            if (errRender) throw errRender;
            res.end(html);
          });
        },
      );
    });
  },

  create: (req, res) => {
    var type_id = req.params.type_id;
    var loginInfo = authIsOwner(req, res);

    db.query("SELECT * FROM boardtype", (error, results) => {
      if (error) throw error;

      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,
        body: "boardC.ejs",
        boardtypes: results,
        type_id: type_id,
      };

      req.app.render("mainFrame", context, (err, html) => {
        if (err) throw err;
        res.end(html);
      });
    });
  },

  create_process: (req, res) => {
    var loginInfo = authIsOwner(req, res);
    if (!loginInfo || loginInfo.cls === "NON") {
      return res.send(`
        <script>
          alert("로그인이 필요한 서비스입니다.");
          location.href = "/";
        </script>
      `);
    }

    var post = req.body;
    var loginid = req.session.loginid;
    var sntzedTitle = sanitizedHtml(post.title);
    var sntzedContent = sanitizedHtml(post.content);
    var sntzedPassword = sanitizedHtml(post.password);
    var type_id = post.type_id;

    var now = new Date();
    var dateStr =
      now.getFullYear() +
      "." +
      String(now.getMonth() + 1).padStart(2, "0") +
      "." +
      String(now.getDate()).padStart(2, "0") +
      " : " +
      String(now.getHours()).padStart(2, "0") +
      "시 " +
      String(now.getMinutes()).padStart(2, "0") +
      "분 " +
      String(now.getSeconds()).padStart(2, "0") +
      "초";

    db.query(
      `INSERT INTO board (type_id, loginid, title, content, date, password) 
       VALUES(?, ?, ?, ?, ?, ?)`,
      [type_id, loginid, sntzedTitle, sntzedContent, dateStr, sntzedPassword],
      (error, result) => {
        if (error) throw error;
        res.redirect(`/board/view/${type_id}/1`);
      },
    );
  },

  detail: (req, res) => {
    var board_id = req.params.board_id;
    var pNum = req.params.pNum;

    var loginInfo = authIsOwner(req, res);
    var sql1 = `SELECT * FROM boardtype; `;
    var sql2 = `
      SELECT b.board_id, b.type_id, b.loginid, p.name AS writer_name, b.title, b.content, b.date 
      FROM board b 
      LEFT JOIN person p ON b.loginid = p.loginid 
      WHERE b.board_id = ?; 
    `;

    db.query(sql1 + sql2, [board_id], (error, results) => {
      if (error) throw error;

      var post = results[1][0];

      if (!post) {
        return res.send(`
          <script>
            alert("존재하지 않거나 삭제된 게시글입니다.");
            history.back();
          </script>
        `);
      }

      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,
        userId: req.session.loginid || "",
        body: "boardR.ejs",
        boardtypes: results[0],
        post: post,
        pNum: pNum,
      };

      req.app.render("mainFrame", context, (err, html) => {
        if (err) throw err;
        res.end(html);
      });
    });
  },

  update: (req, res) => {
    var board_id = req.params.board_id;
    var type_id = req.params.type_id;
    var pNum = req.params.pNum;

    var loginInfo = authIsOwner(req, res);
    var sql1 = `SELECT * FROM boardtype; `;
    var sql2 = `
      SELECT b.board_id, b.type_id, b.loginid, p.name AS writer_name, b.title, b.content, b.password
      FROM board b 
      LEFT JOIN person p ON b.loginid = p.loginid 
      WHERE b.board_id = ?; 
    `;

    db.query(sql1 + sql2, [board_id], (error, results) => {
      if (error) throw error;

      var post = results[1][0];

      if (loginInfo.cls !== "MNG" && post.loginid !== req.session.loginid) {
        return res.send(`
          <script>
            alert("수정 권한이 없습니다.");
            history.back();
          </script>
        `);
      }

      var context = {
        who: loginInfo.name,
        login: loginInfo.login,
        cls: loginInfo.cls,
        body: "boardU.ejs",
        boardtypes: results[0],
        post: post,
        pNum: pNum,
        type_id: type_id,
      };

      req.app.render("mainFrame", context, (err, html) => {
        if (err) throw err;
        res.end(html);
      });
    });
  },

  update_process: (req, res) => {
    var loginInfo = authIsOwner(req, res);
    if (!loginInfo || loginInfo.cls === "NON") {
      return res.send(
        `<script>alert("로그인이 필요합니다."); location.href="/";</script>`,
      );
    }

    var post = req.body;
    var board_id = post.board_id;
    var type_id = post.type_id;
    var pNum = post.pNum;
    var sntzedBoardId = board_id;
    var sntzedTypeId = type_id;
    var sntzedpNum = pNum;

    var sntzedTitle = sanitizedHtml(post.title);
    var sntzedContent = sanitizedHtml(post.content);
    var sntzedPassword = sanitizedHtml(post.password);
    if (loginInfo.cls === "MNG") {
      db.query(
        `UPDATE board SET title = ?, content = ? WHERE board_id = ?`,
        [sntzedTitle, sntzedContent, board_id],
        (error, result) => {
          if (error) throw error;
          res.redirect(`/board/detail/${board_id}/${pNum}`);
        },
      );
    } else if (loginInfo.cls === "CST") {
      db.query(
        `SELECT password FROM board WHERE board_id = ?`,
        [board_id],
        (error, results) => {
          if (error) throw error;

          if (results.length > 0 && results[0].password === sntzedPassword) {
            db.query(
              `UPDATE board SET title = ?, content = ? WHERE board_id = ?`,
              [sntzedTitle, sntzedContent, board_id],
              (error2, result2) => {
                if (error2) throw error2;
                res.redirect(`/board/detail/${board_id}/${pNum}`);
              },
            );
          } else {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(`
              <script type="text/javascript">
                alert("비밀번호가 일치하지 않습니다.");
                setTimeout(function() {
                  location.href = "/board/update/${sntzedBoardId}/${sntzedTypeId}/${sntzedpNum}";
                }, 1000);
              </script>
            `);
          }
        },
      );
    } else {
      res.send(
        `<script>alert("수정 권한이 없습니다."); history.back();</script>`,
      );
    }
  },

  delete_process: (req, res) => {
    var board_id = req.params.board_id;
    var type_id = req.params.type_id;

    var loginInfo = authIsOwner(req, res);
    if (!loginInfo || loginInfo.cls === "NON") {
      return res.send(
        `<script>alert("로그인이 필요합니다."); location.href="/";</script>`,
      );
    }

    if (loginInfo.cls === "MNG") {
      db.query(
        `DELETE FROM board WHERE board_id = ?`,
        [board_id],
        (error, result) => {
          if (error) throw error;
          res.redirect(`/board/view/${type_id}/1`);
        },
      );
    } else if (loginInfo.cls === "CST") {
      db.query(
        `DELETE FROM board WHERE board_id = ? AND loginid = ?`,
        [board_id, req.session.loginid],
        (error, result) => {
          if (error) throw error;

          if (result.affectedRows === 0) {
            return res.send(
              `<script>alert("삭제 권한이 없습니다."); history.back();</script>`,
            );
          }

          res.redirect(`/board/view/${type_id}/1`);
        },
      );
    } else {
      res.send(
        `<script>alert("삭제 권한이 없습니다."); history.back();</script>`,
      );
    }
  },
};
