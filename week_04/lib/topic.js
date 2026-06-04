const db = require("./db");
module.exports = {
  home: (req, res) => {
    db.query("SELECT * FROM topic", (error, results) => {
      // connection이었던 변수를 db로 수정

      var context = {
        list: results, // results가 아니라 list를 넘겨줌
        title: "welcome-db 모듈 생성",
      };

      console.log(context);
      res.render("home", context, (err, html) => {
        res.send(html);
      });
    });
  },

  page: (req, res) => {
    var id = req.params.id;
    db.query("SELECT * FROM topic", (error, results) => {
      db.query(`select * from topic where id = ${id}`, (error, results) => {
        var context = {
          list: results,
          title: "welcome-db 모듈 생성",
          desc: results[0].descript,
        };

        res.render("home", context, (err, html) => {
          res.send(html);
        });
      });
    });
  },
};
