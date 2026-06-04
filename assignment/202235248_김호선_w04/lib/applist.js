const db = require("./db");
module.exports = {
  home: (req, res) => {
    db.query("SELECT * FROM AppsList", (error, results) => {
      var context = {
        list: results,
        title: "앱 목록",
      };
      res.render("home", context, (err, html) => {
        res.send(html);
      });
    });
  },

  detail: (req, res) => {
    var name = req.params.name;
    db.query("SELECT * FROM AppsList", (error, ALL) => {
      db.query(
        "select * from AppsList where name = ?",
        [name],
        (error, Goal) => {
          var context = {
            // list: results,
            title: Goal[0].name,
            name: Goal[0].name,
            category: Goal[0].class,
            desc: Goal[0].descript,
          };
          res.render("detail", context, (err, html) => {
            res.send(html);
          });
        },
      );
    });
  },
};
