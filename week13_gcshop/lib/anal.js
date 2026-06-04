// lib/anal.js
var db = require("./db");

function checkCEO(req, res) {
  if (
    !req.session ||
    !req.session.is_logined ||
    (req.session.cls !== "MNG" && req.session.cls !== "CEO")
  ) {
    res.send(
      `<script>alert("경영자 권한이 없습니다."); location.href = "/";</script>`,
    );
    return null;
  }
  return req.session;
}

module.exports = {
  customeranal: (req, res) => {
    var loginInfo = checkCEO(req, res);
    if (!loginInfo) return;

    var sql1 = `SELECT * FROM boardtype; `;
    var sql2 = `
      select address, ROUND(( count(*) / ( select count(*) from person )) * 100, 2) as rate 
      from person 
      group by address;
    `;

    db.query(sql1 + sql2, (error, results) => {
      if (error) throw error;

      res.render("mainFrame", {
        who: loginInfo.name,
        login: true,
        cls: loginInfo.cls,
        body: "customeranal.ejs",
        boardtypes: results[0],
        percentage: results[1],
      });
    });
  },
};
